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
} from "ivi"
import { div, canvas } from "ivi-html"
import * as styles from "./index.scss"
import * as Toolbar from "../tools/toolbar"
import * as Theme from "../theme"
import * as Layers from "../layers/view"
import * as Input from "../input"
import * as Canvas from "../canvas"
import * as Setup from "./setup"
import { SetOnce, FrameStream, CancelFrameStream, Lazy, Store, PerfTracker } from "../util"
import * as Buttons from "../views/buttons"
import * as Debugging from "../debugging"
import * as Signals from "../signals"

// HMR hooks
declare global {
    interface NodeModule {
        readonly hot?: {
            accept(): void
        }
    }
}

const App = component(c => {
    const removeInputListeners = new SetOnce<Input.RemoveListeners>()
    const cancelFrameStream = new SetOnce<CancelFrameStream>()
    const canvasModel = new SetOnce<Canvas.Canvas>()
    const debuggingGl = new SetOnce<WebGLRenderingContext>()
    const perfTrackerData = Signals.create<readonly PerfTracker.Sample[]>([])
    const store = Store.create<
        Canvas.State,
        Canvas.EphemeralState,
        Canvas.CanvasMsg,
        Canvas.Effect
    >({
        initialState: Canvas.initState(),
        initialEphemeral: Canvas.initEphemeral(),
        effectsHandler: new Lazy(() => (ef: Canvas.Effect) => canvasModel.value.handle(ef)),
        forceRender: () => invalidate(c),
        update: Canvas.update,
    })
    const sender = Canvas.createSender(store.send)
    const canvasRef = box<OpState | null>(null)

    let prevTheme: Theme.Theme | null = null
    const updateTheme = useEffect<Theme.Theme>(c, nextTheme => {
        if (prevTheme === null) {
            Theme.updateAll(nextTheme)
        } else {
            Theme.updateDiff(prevTheme, nextTheme)
        }
        prevTheme = nextTheme
    })

    const updateCanvas = useLayoutEffect<Canvas.State>(c, nextState => {
        canvasModel.value.update(nextState)
    })

    const setupCanvas = useLayoutEffect(c, () => {
        console.log("Painter mounted")
        const htmlCanvas = findDOMNode<HTMLCanvasElement>(canvasRef)
        if (htmlCanvas == null) {
            throw "Canvas not found"
        }

        {
            const canvas = Canvas.Canvas.create(htmlCanvas, store.getState(), {
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

        removeInputListeners.set(
            Input.listen(htmlCanvas, {
                click: sender.onClick,
                release: sender.onRelease,
                move: x => {
                    /**/
                },
                drag: sender.onDrag,
            })
        )
        cancelFrameStream.set(FrameStream.make(sender.onFrame))

        if (process.env.NODE_ENV !== "production") {
            Setup.setup(() => store.getState(), sender).then(() => {
                invalidate(c)
            })
        }

        return () => {
            removeInputListeners.value()
            cancelFrameStream.value()
            canvasModel.value.dispose()
            console.log("Painter unmounted")
        }
    })

    return (): Op => {
        const state = store.getState()

        setupCanvas()
        updateCanvas(state)
        updateTheme(state.theme)

        return div(styles.appContainer, _, [
            div(styles.wrapper, _, [
                Toolbar.View({
                    msgSender: sender.tool,
                    tool: state.tool,
                    transientState: { isDetailsExpanded: true },
                }),
                Ref(
                    canvasRef,
                    canvas(_, { width: 800, height: 800, style: { cursor: "crosshair " } })
                ),
                div(
                    _,
                    { style: { width: "14rem" } },
                    Layers.LayersView({
                        layers: state.layers,
                        sender: sender.layer,
                    })
                ),
            ]),
            div(
                styles.bottomLeft,
                _,
                Buttons.PrimaryButton({
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
                          state,
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

    if (typeof module.hot === "object") {
        module.hot.accept()
    }
}
