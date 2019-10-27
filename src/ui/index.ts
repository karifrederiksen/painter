import {
    Op,
    component,
    _,
    invalidate,
    render,
    box,
    findDOMNode,
    OpState,
    useEffect,
    Ref,
    useLayoutEffect,
    useUnmount,
} from "ivi"
import { div, canvas } from "ivi-html"
import * as styles from "./index.scss"
import * as Toolbar from "./toolbar"
import * as Camera from "../tools/camera"
import * as Theme from "./theme"
import * as Layers from "./layers"
import * as Input from "../canvas/input"
import * as Keymapping from "../canvas/keymapping"
import * as Canvas from "../canvas"
import * as Setup from "./setup"
import {
    SetOnce,
    FrameStream,
    CancelFrameStream,
    Store,
    PerfTracker,
    Vec2,
    Signals,
    PushOnlyArray,
} from "../util"
import { PrimaryButton, Surface } from "./views"
import * as Debugging from "./debugging"
import { MiniMapDetails } from "./miniMap"

function getCanvasOffset(canvas: HTMLCanvasElement): Vec2 {
    return new Vec2(canvas.offsetLeft, canvas.offsetTop)
}

function getCanvasInfo({
    canvasOffset,
    canvasResolution,
}: {
    readonly canvasOffset: Vec2
    readonly canvasResolution: Vec2
}): Canvas.CanvasInfo {
    return {
        resolution: canvasResolution,
        halfResoution: canvasResolution.multiplyScalar(0.5),
        offset: canvasOffset,
    }
}

interface Disposals extends PushOnlyArray<() => void> {}

const App = component(c => {
    const [initialState, initialEphemeral] = Canvas.initState()
    const canvasModel = new SetOnce<Canvas.Canvas>()
    const debuggingGl = new SetOnce<WebGLRenderingContext>()
    const perfTrackerData = Signals.create<readonly PerfTracker.Sample[]>([])
    const canvasRef = box<OpState | null>(null)

    const canvasResolution = new Vec2(800, 800)

    let canvasInfo: Canvas.CanvasInfo = getCanvasInfo({
        canvasOffset: new Vec2(initialState.tool.camera.offsetX, initialState.tool.camera.offsetY),
        canvasResolution,
    })

    const store = Store.create<Canvas.Config, Canvas.State, Canvas.CanvasMsg, Canvas.Effect>({
        initialState,
        initialEphemeral,
        effectsHandler: (ef: Canvas.Effect) => {
            try {
                canvasModel.value.handle(ef)
            } catch (ex) {
                console.error(ef, ex)
            }
        },
        forceRender: () => invalidate(c),
        update: (state, ephState, msg) => Canvas.update(canvasInfo, state, ephState, msg),
    })

    {
        function onResize() {
            canvasInfo = getCanvasInfo({
                canvasOffset: getCanvasOffset(findDOMNode(canvasRef) as HTMLCanvasElement),
                canvasResolution,
            })
        }
        document.addEventListener("resize", onResize)
        useUnmount(c, () => {
            document.removeEventListener("resize", onResize)
        })
    }

    const sender = new Canvas.MsgSender(store.send)

    let prevTheme: Theme.Theme | null = null
    const updateTheme = useEffect<Theme.Theme>(c, nextTheme => {
        if (prevTheme === null) {
            Theme.updateAll(nextTheme)
        } else {
            Theme.updateDiff(prevTheme, nextTheme)
        }
        prevTheme = nextTheme
    })

    const setupCanvas = useLayoutEffect(c, () => {
        const disposals: Disposals = []
        console.log("Painter mounted")
        const htmlCanvas = findDOMNode<HTMLCanvasElement>(canvasRef)
        if (htmlCanvas == null) {
            throw "Canvas not found"
        }

        canvasInfo = getCanvasInfo({
            canvasOffset: getCanvasOffset(htmlCanvas),
            canvasResolution,
        })

        {
            const canvas = Canvas.Canvas.create(htmlCanvas, {
                onStats: stats => {
                    perfTrackerData.push(stats)
                },
                onWebglContextCreated: gl => {
                    debuggingGl.set(gl)
                },
            })
            if (canvas === null) {
                throw "Failed to initialize Canvas"
            }

            canvasModel.set(canvas)
        }

        disposals.push(
            Input.listen(htmlCanvas, {
                click: sender.onClick,
                release: sender.onRelease,
                move: x => {
                    /**/
                },
                drag: sender.onDrag,
            })
        )
        disposals.push(
            Keymapping.listen({
                handle: sender.onKeyboard,
            })
        )
        disposals.push(FrameStream.make(sender.onFrame))
        disposals.push(() => canvasModel.value.dispose())

        if (process.env.NODE_ENV !== "production") {
            Setup.setup(htmlCanvas, () => store.getState(), sender).then(() => {
                invalidate(c)
            })
        }

        return () => {
            for (let i = 0; i < disposals.length; i++) {
                disposals[i]()
            }
            console.log("Painter unmounted")
        }
    })

    function getCanvasTransform(cam: Camera.Config): string {
        const translate = "translate(" + cam.offsetX + "px, " + cam.offsetY + "px) "
        const rotate = "rotate(" + cam.rotateTurns + "turn) "
        const scale = "scale(" + cam.zoomPct + ", " + cam.zoomPct + ")"
        return translate + rotate + scale
    }

    return (): Op => {
        const state = store.getState()

        setupCanvas()
        updateTheme(state.theme)

        return div(styles.appContainer, _, [
            div(styles.wrapper, _, [
                Toolbar.Toolbar({
                    msgSender: sender.tool,
                    tool: state.tool,
                    transientState: { isDetailsExpanded: true },
                }),
                Ref(
                    canvasRef,
                    canvas(styles.canvas, {
                        width: canvasResolution.x,
                        height: canvasResolution.y,
                        style: {
                            transform: getCanvasTransform(state.tool.camera),
                        },
                    })
                ),
                div(styles.layersViewContainer, _, [
                    Surface(
                        MiniMapDetails({
                            camera: state.tool.camera,
                            sender: sender.tool.camera,
                        })
                    ),
                    Layers.LayersView({
                        layers: state.layers,
                        sender: sender.layer,
                    }),
                ]),
            ]),
            div(
                styles.bottomLeft,
                _,
                PrimaryButton({
                    content: "Next theme",
                    onClick: sender.randomizeTheme,
                })
            ),
            process.env.NODE_ENV !== "development"
                ? null
                : div(
                      styles.bottomRight,
                      _,
                      Debugging.DebugWindow({
                          gl: debuggingGl,
                          themeRng: store.getEphemeral().themeRng,
                          perfSamplesSignal: perfTrackerData.signal,
                      })
                  ),
        ])
    }
})

{
    const rootElement = document.getElementById("canvas-root")

    if (rootElement === null) {
        throw "canvas-root not found"
    }

    render(App(), rootElement)
}
