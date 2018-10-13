import * as React from "react"
import * as ReactDOM from "react-dom"
import styled from "../styled"
import { ThemeProvider, injectGlobal } from "../styled"
import * as Toolbar from "./toolbar"
import * as Layers from "./layers"
import * as Input from "../input"
import * as Canvas from "../canvas"
import * as Theme from "../theme"
import * as Scenarios from "../scenarios"
import { SetOnce, FrameStream, CancelFrameStream, Lazy } from "../util"
import * as Buttons from "../components/buttons"
import * as Store from "../store"

// HMR hooks
declare global {
    interface NodeModule {
        readonly hot?: {
            accept(): void
        }
    }
}

type PainterProps = {
    readonly state: Canvas.State
    readonly frameStream: FrameStream
}

const Wrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    box-sizing: border-box !important;

    ** {
        margin: 0;
        padding: 0;
        border: 0;
        outline: none;
        box-sizing: inherit;
    }
`

const BottomLeft = styled.div`
    position: absolute;
    left: 0.5rem;
    bottom: 0.5rem;
`

const AppContainer = styled.div`
    font-family: ${p => p.theme.fonts.normal};
`
class Painter extends React.Component<PainterProps, Canvas.State> {
    private readonly removeInputListeners: SetOnce<Input.RemoveListeners>
    private readonly cancelFrameStream: SetOnce<CancelFrameStream>
    private readonly canvas: SetOnce<Canvas.Canvas>
    private readonly store: Store.Store<Canvas.State, Canvas.CanvasMsg>
    private readonly sender: Canvas.MsgSender
    private htmlCanvas: HTMLCanvasElement | null
    private currentGlobalTheme: Theme.Theme

    constructor(props: PainterProps) {
        super(props)
        this.state = props.state
        this.removeInputListeners = new SetOnce()
        this.cancelFrameStream = new SetOnce()
        this.canvas = new SetOnce()
        this.store = Store.createStore<Canvas.State, Canvas.CanvasMsg, Canvas.Effect>({
            initialState: this.state,
            effectsHandler: new Lazy(() => (ef: Canvas.Effect) => this.canvas.value.handle(ef)),
            setState: state => this.setState(state),
            update: Canvas.update,
        })
        this.sender = Canvas.createSender(this.store.send)
        this.htmlCanvas = null
        this.setGlobalTheme()
        this.currentGlobalTheme = this.state.theme
    }

    private setGlobalTheme() {
        const theme = this.state.theme
        if (theme === this.currentGlobalTheme) return

        // In styled-components v4, there will be a component that takes care of global css
        // currently there is no cleanup of previous styles...
        injectGlobal`
            body {
                background-color: ${theme.color.background.toStyle()};
            }
        `
        this.currentGlobalTheme = this.state.theme
    }

    render() {
        const state = this.state
        const sender = this.sender

        this.setGlobalTheme()

        return (
            <ThemeProvider theme={state.theme}>
                <AppContainer>
                    <Wrapper>
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
                    </Wrapper>
                    <BottomLeft>
                        <Buttons.PrimaryButton onClick={sender.randomizeTheme}>
                            Next theme
                        </Buttons.PrimaryButton>
                    </BottomLeft>
                </AppContainer>
            </ThemeProvider>
        )
    }

    componentDidMount() {
        console.log("Painter mounted")
        const htmlCanvas = this.htmlCanvas
        if (htmlCanvas == null) throw "Canvas not found"

        {
            const canvas = Canvas.Canvas.create(htmlCanvas, this.state, {
                onStats: stats => {
                    console.log(stats)
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
        this.cancelFrameStream.set(this.props.frameStream(this.sender.onFrame))

        if (process.env.NODE_ENV !== "production") {
            Scenarios.setup(() => this.state, this.sender)
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

    ReactDOM.render(
        <Painter state={Canvas.initState()} frameStream={FrameStream.make} />,
        rootElement
    )

    if (typeof module.hot === "object") {
        module.hot.accept()
    }
}
