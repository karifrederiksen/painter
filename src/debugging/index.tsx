import * as React from "react"
import * as styles from "./index.scss"
import { SetOnce, PerfTracker } from "../util"
import { Surface } from "../views/surface"
import { DefaultButton } from "../views/buttons"
import * as Canvas from "../canvas"
import * as Signals from "../signals"
import { Scripting } from "./scripting"
import { Performance } from "./performance"

interface DebugWindowProps {
    readonly state: Canvas.State
    readonly gl: SetOnce<WebGLRenderingContext>
    readonly perfSamplesSignal: Signals.Signal<readonly PerfTracker.Sample[]>
}

// let's get the webgl context in here somehow!
// there's a lot of stuff I could use that for... maybe even eval?

const DebugWindow_ = React.memo(function DebugWindow(props: DebugWindowProps) {
    const [isOpen, setOpen] = React.useState(false)
    const { state } = props

    return (
        <Surface>
            {!isOpen ? (
                <DefaultButton onClick={() => setOpen(true)}>Debug</DefaultButton>
            ) : (
                <div className={styles.container}>
                    <DefaultButton onClick={() => setOpen(false)}>Close</DefaultButton>
                    <div className={styles.contentContainer}>
                        RNG:
                        <div className={styles.monospaced}>{state.rng.display()}</div>
                        <Performance samplesSignal={props.perfSamplesSignal} />
                        <Scripting gl={props.gl} />
                    </div>
                </div>
            )}
        </Surface>
    )
})

export function DebugWindow(props: DebugWindowProps) {
    return React.createElement(DebugWindow_, props)
}
