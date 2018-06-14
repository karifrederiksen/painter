import * as React from "react"
import styled from "styled-components"

export class SinkableButton extends React.PureComponent<{
    readonly onClick: () => void
    readonly onDownClick?: () => void
    readonly isDown: boolean
    readonly children: React.ReactNode
    readonly dataKey: string
}> {
    render(): JSX.Element {
        const props = this.props
        return props.isDown ? (
            <SunkButton key={props.dataKey} onClick={props.onDownClick}>
                {props.children}
            </SunkButton>
        ) : (
            <UnsunkButton key={props.dataKey} onClick={props.onClick}>
                {props.children}
            </UnsunkButton>
        )
    }
}

const UnsunkButton = styled.button`
    background-color: rgba(0, 0, 0, 0);
    padding: 12px 16px;
    border: 0;
    border-bottom: 1px solid transparent;
    transition: background-color 0.15s;

    &:hover {
        background-color: rgba(0, 0, 0, 0.15);
    }
`

const SunkButton = styled.button`
    background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
    padding: 12px 16px;
    border: 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
`
