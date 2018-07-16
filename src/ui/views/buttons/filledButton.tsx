import { InfernoChildren } from "inferno"
import { css } from "emotion"
import {
    CSS_COLOR_DEFAULT,
    CSS_COLOR_DEFAULT_HIGHLIGHT,
    CSS_COLOR_TEXT_LIGHTEST,
    CSS_COLOR_TEXT_DARK,
    CSS_COLOR_PRIMARY,
} from "ui/css"

const buttonCommon = css`
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

const primaryButtonClass = css`
    ${buttonCommon};
    background-color: ${CSS_COLOR_PRIMARY};
    color: ${CSS_COLOR_TEXT_DARK};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${CSS_COLOR_DEFAULT_HIGHLIGHT};
    }
`

const defaultButtonClass = css`
    ${buttonCommon};
    background-color: ${CSS_COLOR_DEFAULT};
    color: ${CSS_COLOR_TEXT_LIGHTEST};
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);

    &:hover {
        background-color: ${CSS_COLOR_DEFAULT_HIGHLIGHT};
        color: ${CSS_COLOR_TEXT_DARK};
    }
`

export interface ButtonsProps {
    readonly onClick: () => void
    readonly children: InfernoChildren
    readonly tooltip?: string
}

export function PrimaryButton(props: ButtonsProps): JSX.Element {
    return (
        <button className={primaryButtonClass} onclick={props.onClick} title={props.tooltip}>
            {props.children}
        </button>
    )
}

export function DefaultButton(props: ButtonsProps): JSX.Element {
    return (
        <button className={defaultButtonClass} onclick={props.onClick} title={props.tooltip}>
            {props.children}
        </button>
    )
}
