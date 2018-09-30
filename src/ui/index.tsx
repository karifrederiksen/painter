import * as React from "react"
import styled from "../styled"
import { ThemeProvider, injectGlobal } from "../styled"
import * as Toolbar from "./toolbar"
import * as Layers from "./layers"
import * as Input from "../input"
import * as Canvas from "../canvas"
import * as Theme from "../theme"
import { SetOnce, FrameStream, CancelFrameStream } from "../util"
import { PrimaryButton } from "../components/buttons"

export function start(): JSX.Element {
    return <Painter state={Canvas.initState()} frameStream={FrameStream.make} />
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

interface PainterState {
    readonly persistent: Canvas.State
    readonly transient: TransientState
}

interface TransientState {
    readonly toolBar: Toolbar.TransientState
}

function initTransient(): TransientState {
    return {
        toolBar: { isDetailsExpanded: true },
    }
}

const BottomLeft = styled.div`
    position: absolute;
    left: 0.5rem;
    bottom: 0.5rem;
`

const AppContainer = styled.div`
    font-family: ${p => p.theme.fonts.normal};
`

class Painter extends React.Component<PainterProps, PainterState> {
    private removeInputListeners: SetOnce<Input.RemoveListeners>
    private cancelFrameStream: SetOnce<CancelFrameStream>
    private canvas: SetOnce<Canvas.Canvas>
    private htmlCanvas: HTMLCanvasElement | null
    private transientState: TransientState
    private readonly sender: Canvas.MsgSender
    private currentGlobalTheme: Theme.Theme

    constructor(props: PainterProps) {
        super(props)
        this.state = {
            persistent: props.state,
            transient: initTransient(),
        }
        this.removeInputListeners = new SetOnce()
        this.cancelFrameStream = new SetOnce()
        this.canvas = new SetOnce()
        this.sender = Canvas.createSender(msg => {
            //console.log("Message of type ", msg.type, "with payload", msg.payload)
            this.setState((state: PainterState) => ({
                ...state,
                persistent: Canvas.update(state.persistent, msg),
            }))
        })
        this.htmlCanvas = null
        this.transientState = {
            toolBar: { isDetailsExpanded: true },
        }
        this.setGlobalTheme()
        this.currentGlobalTheme = this.state.persistent.theme
    }

    private setGlobalTheme() {
        const theme = this.state.persistent.theme
        if (theme === this.currentGlobalTheme) return

        // In styled-components v4, there will be a component that takes care of global css
        // currently there is no cleanup of previous styles...
        injectGlobal`
            body {
                background-color: ${theme.color.background.toStyle()};
            }
        `
        this.currentGlobalTheme = this.state.persistent.theme
    }

    render() {
        const state = this.state

        this.setGlobalTheme()

        return (
            <ThemeProvider theme={state.persistent.theme}>
                <AppContainer>
                    <Wrapper>
                        <Toolbar.View
                            tool={state.persistent.tool}
                            transientState={state.transient.toolBar}
                            msgSender={this.sender.tool}
                        />
                        <canvas
                            width="800"
                            height="800"
                            key="muh-canvas"
                            ref={x => (this.htmlCanvas = x)}
                            style={{ cursor: "crosshair" }}
                        />
                        <div style={{ width: "14rem" }}>
                            <Layers.LayersView
                                layers={state.persistent.layers}
                                sender={this.sender.layer}
                            />
                        </div>
                    </Wrapper>
                    <BottomLeft>
                        <PrimaryButton onClick={this.sender.randomizeTheme}>
                            Next theme
                        </PrimaryButton>
                    </BottomLeft>
                </AppContainer>
            </ThemeProvider>
        )
    }

    componentDidMount() {
        console.log("Painter mounted")
        const htmlCanvas = this.htmlCanvas
        if (htmlCanvas == null) throw "Canvas not found"

        const canvas = Canvas.Canvas.create(htmlCanvas, {
            onStats: stats => {
                console.log(stats)
            },
        })
        if (canvas === null) throw "Failed to initialize Canvas"

        this.canvas.set(canvas)

        this.removeInputListeners.set(
            Input.listen(htmlCanvas, {
                click: this.onClick,
                release: this.onRelease,
                move: this.onMove,
                drag: this.onDrag,
            })
        )
        this.cancelFrameStream.set(this.props.frameStream(this.onFrame))
    }

    componentWillUnmount() {
        this.removeInputListeners.value()
        this.cancelFrameStream.value()
        this.canvas.value.dispose()
        console.log("Painter unmounted")
    }

    componentDidUpdate() {
        this.canvas.value.onUpdate(this.state.persistent)
    }

    private onClick = (input: Input.PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onClick(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onRelease = (input: Input.PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onRelease(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onMove = (_input: Input.PointerInput): void => {
        //
    }

    private onDrag = (input: Input.PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onDrag(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onFrame = (time: number): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onFrame(state.persistent.tool, time)
        if (tool === state.persistent.tool) {
            this.canvas.value.endFrame(state.persistent)
        } else {
            const persistent = { ...state.persistent, tool }
            const newState: PainterState = { ...state, persistent }
            this.canvas.value.endFrame(persistent)
            this.setState(newState)
        }
    }
}
