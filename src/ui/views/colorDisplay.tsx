import * as React from "react"
import { Hsv } from "core"
import styled from "styled-components"

export type ColorDisplay = {
    readonly color: Hsv
    readonly colorSecondary: Hsv
    readonly onClick: () => void
}

const Container = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 100%;
    height: 1rem;
`

const Secondary = styled.span`
    width: 25%;
    height: 1rem;
    margin-right: 5%;
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 4px 2px 0 rgba(0, 0, 0, 0.14),
        0 6px 1px -2px rgba(0, 0, 0, 0.12);
`

const Primary = styled.span`
    width: 70%;
    height: 1rem;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

export function ColorDisplay({ color, colorSecondary, onClick }: ColorDisplay): JSX.Element {
    return (
        <Container onClick={onClick}>
            <Secondary
                style={{
                    backgroundColor: colorSecondary.toRgb().toCss(),
                }}
            />
            <Primary
                style={{
                    backgroundColor: color.toRgb().toCss(),
                }}
            />
        </Container>
    )
}
