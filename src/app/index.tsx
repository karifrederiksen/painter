import * as React from "react"
import * as ReactDOM from "react-dom"
import { ThemeProvider } from "../styled"
import * as styles from "./index.scss"
import * as Toolbar from "../tools/toolbar"
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

class Painter extends React.Component<{}, Canvas.State> {
    private readonly removeInputListeners: SetOnce<Input.RemoveListeners>
    private readonly cancelFrameStream: SetOnce<CancelFrameStream>
    private readonly canvas: SetOnce<Canvas.Canvas>
    private readonly store: Store<Canvas.State, Canvas.EphemeralState, Canvas.CanvasMsg>
    private readonly debuggingGl: SetOnce<WebGLRenderingContext>
    private readonly perfTrackerData: Signals.PushableSignal<readonly PerfTracker.Sample[]>
    private readonly sender: Canvas.MsgSender
    private htmlCanvas: HTMLCanvasElement | null

    constructor(props: {}) {
        super(props)
        this.state = Canvas.initState()
        this.removeInputListeners = new SetOnce()
        this.cancelFrameStream = new SetOnce()
        this.canvas = new SetOnce()
        this.debuggingGl = new SetOnce()
        this.perfTrackerData = Signals.create([])
        this.store = Store.create<
            Canvas.State,
            Canvas.EphemeralState,
            Canvas.CanvasMsg,
            Canvas.Effect
        >({
            initialState: this.state,
            initialEphemeral: Canvas.initEphemeral(),
            effectsHandler: new Lazy(() => (ef: Canvas.Effect) => this.canvas.value.handle(ef)),
            forceRender: () => this.forceUpdate(),
            update: Canvas.update,
        })
        this.sender = Canvas.createSender(this.store.send)
        this.htmlCanvas = null
    }

    render() {
        const state = this.store.getState()
        const sender = this.sender

        return (
            <React.StrictMode>
                <div className={styles.appContainer}>
                    <ThemeProvider theme={state.theme} />
                    <div className={styles.wrapper}>
                        <Toolbar.View
                            tool={state.tool}
                            transientState={{ isDetailsExpanded: true }}
                            msgSender={sender.tool}
                        />
                        <canvas
                            width="800"
                            height="800"
                            key="muh-canvas"
                            ref={x => (this.htmlCanvas = x)}
                            style={{ cursor: "crosshair" }}
                        />
                        <div style={{ width: "14rem" }}>
                            <Layers.LayersView layers={state.layers} sender={sender.layer} />
                        </div>
                    </div>
                    <div className={styles.bottomLeft}>
                        <Buttons.PrimaryButton onClick={sender.randomizeTheme}>
                            Next theme
                        </Buttons.PrimaryButton>
                    </div>
                    {process.env.NODE_ENV === "development" && (
                        <div className={styles.bottomRight}>
                            <Debugging.DebugWindow
                                state={state}
                                gl={this.debuggingGl}
                                perfSamplesSignal={this.perfTrackerData.signal}
                            />
                        </div>
                    )}
                </div>
            </React.StrictMode>
        )
    }

    componentDidMount() {
        console.log("Painter mounted")
        const htmlCanvas = this.htmlCanvas
        if (htmlCanvas == null) throw "Canvas not found"

        {
            const canvas = Canvas.Canvas.create(htmlCanvas, this.state, {
                onStats: stats => {
                    this.perfTrackerData.push(stats)
                },
                onWebglContextCreated: gl => {
                    this.debuggingGl.set(gl)
                },
            })
            if (canvas === null) throw "Failed to initialize Canvas"

            this.canvas.set(canvas)
        }

        this.removeInputListeners.set(
            Input.listen(htmlCanvas, {
                click: this.sender.onClick,
                release: this.sender.onRelease,
                move: x => {
                    /**/
                },
                drag: this.sender.onDrag,
            })
        )
        this.cancelFrameStream.set(FrameStream.make(this.sender.onFrame))

        if (process.env.NODE_ENV !== "production") {
            Setup.setup(() => this.state, this.sender).then(() => {
                this.forceUpdate()
            })
        }
    }

    componentWillUnmount() {
        this.removeInputListeners.value()
        this.cancelFrameStream.value()
        this.canvas.value.dispose()
        console.log("Painter unmounted")
    }

    componentDidUpdate() {
        this.canvas.value.update(this.state)
    }
}

{
    const rootElement = document.getElementById("canvas-root")

    if (rootElement === null) {
        throw "canvas-root not found"
    }

    ReactDOM.render(<Painter />, rootElement)

    if (typeof module.hot === "object") {
        module.hot.accept()
    }
}
