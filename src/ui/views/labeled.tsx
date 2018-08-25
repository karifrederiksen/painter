import * as React from "react"
import styled from "styled-components"

export type LabeledProps = {
    readonly label: string
    readonly value?: string
    readonly children: React.ReactChild
}

const Container = styled.div`
    color: inherit;
    margin: 0.5rem 0;
    width: 100%;
`

const Label = styled.p`
    color: inherit;
    margin-bottom: 0.25rem;
`

const Content = styled.div`
    width: 100%;
`

const TextContainer = styled.div`
    display: flex;
    justify-content: space-between;
    color: inherit;
    pointer-events: none;
    user-select: none;
`

export function Labeled({ children, label, value }: LabeledProps): JSX.Element {
    return (
        <Container>
            <TextContainer>
                <Label>{label}</Label>
                <Label>{value}</Label>
            </TextContainer>
            <Content>{children}</Content>
        </Container>
    )
}
