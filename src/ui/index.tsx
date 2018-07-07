import * as Inferno from "inferno"
import { css } from "emotion"

import {
    Canvas,
    CanvasState,
    RemoveListeners,
    listenToPointers,
    PointerInput,
    update as canvasUpate,
    MessageSender,
    createSender,
} from "../canvas"
import { FrameStream, CancelFrameStream } from "../frameStream"
import { SetOnce } from "../core"
import { ToolBar, ToolBarTransientState } from "./toolbar"
import { Layers } from "./layers/index"

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

    --color-primary: #aa5bc6;
    --color-primary-highlight: #fa71fc;
    --color-default-light: #ccc;
    --color-default: #777;
    --color-default-dark: #333;
    --color-success: #7a7;
    --color-warning: #aa7;
    --color-danger: #a77;
    --color-info: #77a;
    --color-text-light: #ccc;
    --color-text-dark: #333;
    --color-bg-level-0: #555;
    --color-bg-level-1: #666;
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
    private sender: MessageSender

    constructor(props: PainterProps) {
        super(props)
        this.state = { persistent: props.state, transient: initTransient() }
        this.removeInputListeners = new SetOnce()
        this.cancelFrameStream = new SetOnce()
        this.canvas = new SetOnce()
        this.sender = createSender(msg => {
            console.log("Message of type ", msg.type, "with payload", msg.payload)
            this.setState((state: PainterState) => ({
                ...state,
                persistent: canvasUpate(state.persistent, msg),
            }))
        })
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
                    messageSender={this.sender}
                />
                <canvas
                    width="800"
                    height="800"
                    key="muh-canvas"
                    ref={x => (this.htmlCanvas = x)}
                    style={{ cursor: "crosshair" }}
                />
                <div style={{ width: "12rem" }}>
                    <Layers layers={state.persistent.layers} />
                </div>
            </div>
        )
    }

    componentDidMount() {
        console.log("Painter mounted")
        const htmlCanvas = this.htmlCanvas
        if (htmlCanvas == null) throw "Canvas not found"

        const canvas = Canvas.create(htmlCanvas, {
            onStats: stats => {
                console.log(stats)
            },
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
        console.log("Painter unmounted")
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

    private onMove = (_input: PointerInput): void => {
        //
    }

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
}
