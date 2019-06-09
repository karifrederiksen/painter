import * as React from "react"
import styled from "../styled"
import { SetOnce, PerfTracker } from "../util"
import { Surface } from "../views/surface"
import { DefaultButton } from "../views/buttons"
import * as Canvas from "../canvas"
import * as Rng from "../rng"
import * as Signals from "../signals"
import { Scripting } from "./scripting"
import { Performance } from "./performance"

const Container = styled.div`
    z-index: 100;
    display: flex;
    padding: 0.5rem 1rem;
`

const ContentContainer = styled.div`
    padding-left: 1rem;
`

const Monospaced = styled.div`
    font-family: "Courier New", Courier, monospace;
`

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
                <Container>
                    <DefaultButton onClick={() => setOpen(false)}>Close</DefaultButton>
                    <ContentContainer>
                        RNG:
                        <Monospaced>{Rng.display(state.rng)}</Monospaced>
                        <Performance samplesSignal={props.perfSamplesSignal} />
                        <Scripting gl={props.gl} />
                    </ContentContainer>
                </Container>
            )}
        </Surface>
    )
})

export function DebugWindow(props: DebugWindowProps) {
    return React.createElement(DebugWindow_, props)
}
