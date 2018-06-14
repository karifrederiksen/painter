import { createElement } from "inferno-create-element"
import * as Inferno from "inferno"
import { css, injectGlobal } from "emotion"

import {
    Canvas,
    CanvasState,
    CanvasHooks,
    RemoveListeners,
    listenToPointers,
    PointerInput,
    CanvasMsg,
    defaultState,
    update as canvasUpate,
} from "../canvas"
import { FrameStream, CancelFrameStream } from "../frameStream"
import { SetOnce } from "../data"
import { ToolBar, ToolBarTransientState } from "./toolbar"

export function start(state: CanvasState, frameStream: FrameStream): JSX.Element {
    return <Painter state={state} frameStream={frameStream} />
}

export type PainterProps = {
    readonly state: CanvasState
    readonly frameStream: FrameStream
    //readonly messageStream: (handler: (msg: CanvasMsg) => void) => void
}

const uiWrapper = css`
    display: flex;
    flex-direction: row;
`

injectGlobal`
    html {
        font-size: 16px;
    }

    @media (max-width: 900px) {
        html {
            font-size: 14px;
        }
    }

    * {
        margin: 0;
        padding: 0;
        font-family: "Helvetica", "Arial", sans-serif;
    }

    :root {
        --color-primary: #9c9;
        --color-primary-highlight: #99c;
        --color-success: #7a7;
        --color-warning: #aa7;
        --color-danger: #a77;
        --color-info: #77a;
        --color-text-light: #ccc;
        --color-text-dark: #333;
        --color-bg-level-0: #555;
    }
`

interface PainterState {
    readonly persistent: CanvasState
    readonly transient: TransientState
}

interface TransientState {
    readonly toolBar: ToolBarTransientState
}

function initTransient(): TransientState {
    return {
        toolBar: { isDetailsExpanded: true },
    }
}

export class Painter extends Inferno.Component<PainterProps, PainterState> {
    private removeInputListeners: SetOnce<RemoveListeners>
    private cancelFrameStream: SetOnce<CancelFrameStream>
    private canvas: SetOnce<Canvas>
    private htmlCanvas: HTMLCanvasElement | null
    private transientState: TransientState

    constructor(props: PainterProps) {
        super(props)
        this.state = { persistent: props.state, transient: initTransient() }
        this.removeInputListeners = new SetOnce()
        this.cancelFrameStream = new SetOnce()
        this.canvas = new SetOnce()
        this.htmlCanvas = null
        this.transientState = {
            toolBar: { isDetailsExpanded: true },
        }
    }

    render() {
        const state = this.state as PainterState
        return (
            <div className={uiWrapper}>
                <ToolBar
                    tool={state.persistent.tool}
                    transientState={state.transient.toolBar}
                    sendMessage={this.sendMessage}
                />
                <canvas
                    width="800"
                    height="800"
                    key="muh-canvas"
                    ref={x => (this.htmlCanvas = x)}
                    style={{ cursor: "crosshair" }}
                />
                Right side
            </div>
        )
    }

    componentDidMount() {
        const htmlCanvas = this.htmlCanvas
        if (htmlCanvas == null) throw "Canvas not found"

        const canvas = Canvas.create(htmlCanvas, {
            onStats: stats => console.log(stats),
        })
        if (canvas === null) throw "Failed to initialize Canvas"

        this.canvas.set(canvas)

        this.removeInputListeners.set(
            listenToPointers(htmlCanvas, {
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
    }

    private onClick = (input: PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onClick(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onRelease = (input: PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onRelease(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onMove = (input: PointerInput): void => {}

    private onDrag = (input: PointerInput): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onDrag(state.persistent.tool, input)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.setState(newState)
    }

    private onFrame = (time: number): void => {
        const state = this.state as PainterState
        const tool = this.canvas.value.onFrame(state.persistent.tool, time)
        const persistent = { ...state.persistent, tool }
        const newState: PainterState = { ...state, persistent }
        this.canvas.value.endFrame(persistent)
        this.setState(newState)
    }

    private sendMessage = (message: CanvasMsg): void =>
        this.setState((state: PainterState) => ({
            ...state,
            persistent: canvasUpate(state.persistent, message),
        }))
}
