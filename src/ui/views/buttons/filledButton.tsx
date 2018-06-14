import { Props } from "inferno"
import { createElement } from "inferno-create-element"
import { css } from "emotion"
// @
const primaryButtonClass = css`
    display: inline-flex;
    outline: none;
    justify-content: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    background-color: var(--color-primary);
    color: var(--color-text-dark);
    border: 0;
    border-radius: 0.25rem;
    height: auto;
    padding: 0.5rem;
    height: 2.25rem;
    width: auto;
    min-width: 4rem;
    transition: background-color 0.15s;
    line-height: 1.4em;
    cursor: pointer;

    &:hover {
        background-color: var(--color-primary-highlight);
    }
`
export function PrimaryButton(props: Props<{}, {}>): JSX.Element {
    return <button className={primaryButtonClass}>{props.children}</button>
}
