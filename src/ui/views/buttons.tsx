import * as React from "react"
import styled from "../styled"

const ButtonCommon = styled.button`
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    border: 0;
    border-radius: 0.25rem;
    padding: 0.5rem;
    height: 2.25rem;
    width: 100%;
    min-width: 4rem;
    transition: all 150ms;
    line-height: 1.4em;
`

export const PrimaryButton = styled(ButtonCommon)`
    background-color: ${p => p.theme.colorPrimary.toStyle()};
    color: ${p => p.theme.colorTextDark.toStyle()};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${p => p.theme.colorDefaultLight.toStyle()};
    }
`

export const DefaultButton = styled(ButtonCommon)`
    background-color: ${p => p.theme.colorDefault.toStyle()};
    color: ${p => p.theme.colorTextDark.toStyle()};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${p => p.theme.colorDefaultLight.toStyle()};
        color: ${p => p.theme.colorTextDark.toStyle()};
    }
`

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
