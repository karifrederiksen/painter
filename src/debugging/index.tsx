import * as React from "react"
import styled from "../styled"
import { Surface } from "../views/surface"
import { DefaultButton } from "../views/buttons"
import * as Canvas from "../canvas"
import * as Rng from "../rng"

const Container = styled.div`
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
}

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
                        RNG: <Monospaced>{Rng.display(state.rng)}</Monospaced>
                        Hello!
                        <p>Awefawedfawed aserfaefa awefawef</p>
                    </ContentContainer>
                </Container>
            )}
        </Surface>
    )
})

export function DebugWindow(props: DebugWindowProps) {
    return React.createElement(DebugWindow_, props)
}
