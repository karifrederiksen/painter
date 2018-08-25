import * as React from "react"
import styled from "styled-components"

export type InlineLabeledProps = {
    readonly label: string
    readonly children: React.ReactChild
}

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;
    margin: 0.25rem 0;
    width: 100%;
`

const Label = styled.div`
    color: inherit;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
`

export function InlineLabeled({ children, label }: InlineLabeledProps): JSX.Element {
    return (
        <Container>
            <Label>{label}</Label>
            {children}
        </Container>
    )
}
