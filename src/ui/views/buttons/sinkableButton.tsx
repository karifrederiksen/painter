import * as React from "react"
import styled from "styled-components"

const UnsunkButton = styled.button`
    background-color: rgba(0, 0, 0, 0);
    padding: 12px 16px;
    border: 0;
    border-bottom: 2px solid transparent;
    transition: background-color 0.15s;

    &:hover {
        background-color: rgba(0, 0, 0, 0.15);
    }
`

const SunkButton = styled.button`
    background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
    padding: 12px 16px;
    border: 0;
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
`

export function SinkableButton(props: {
    readonly onClick: () => void
    readonly onDownClick?: () => void
    readonly isDown: boolean
    readonly children: React.ReactNode
    readonly dataKey: string
}): JSX.Element {
    const El = props.isDown ? SunkButton : UnsunkButton
    return (
        <El key={props.dataKey} onClick={props.isDown ? props.onDownClick : props.onClick}>
            {props.children}
        </El>
    )
}
