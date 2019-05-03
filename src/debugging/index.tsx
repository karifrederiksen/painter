import * as React from "react"
import styled from "../styled"

const Container = styled.div`
    position: absolute;
    right: 0;
    bottom: 0;
`

export function DebugWindow() {
    const a = 2
    const b: 2 = 2
    return (
        <Container id="d">
            Hello! {b} {a} aaa {2}
        </Container>
    )
}
