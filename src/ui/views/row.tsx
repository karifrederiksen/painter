import * as React from "react"
import styled from "styled-components"

export interface RowProps {
    readonly spacing?: string
    readonly children: ReadonlyArray<React.ReactChild>
}

const Row_ = styled.div`
    display: flex;
    flex-direction: row;
`

const Col_ = styled.div`
    width: 100%;
`

export function Row({ spacing, children }: RowProps): JSX.Element {
    spacing = spacing || "0"
    const spacedChildren = new Array<React.ReactChild>(children.length)

    if (children.length > 0) {
        spacedChildren[0] = <Col_ key="0">{children[0]}</Col_>
        for (let i = 1; i < children.length; i++) {
            spacedChildren[i] = (
                <Col_ key={i.toString()} style={{ marginLeft: spacing }}>
                    {children[i]}
                </Col_>
            )
        }
    }

    return <Row_>{spacedChildren}</Row_>
}
