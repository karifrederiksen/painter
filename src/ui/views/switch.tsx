import { css } from "emotion"
import { CSS_COLOR_DEFAULT_HIGHLIGHT, CSS_COLOR_PRIMARY, CSS_COLOR_DEFAULT } from "ui/css"

export type SwitchProps = {
    readonly checked: boolean
    readonly onCheck: (checked: boolean) => void
    readonly color?: string
}

const switchClass = css`
    cursor: pointer;
    display: inline-flex;
    margin: 0.5rem 0;
`

const switchButtonContainerClass = css`
    display: inline-flex;
    position: absolute;
    z-index: 2;
    transition: 150ms transform;
`

const switchButtonClass = css`
    cursor: pointer;
    width: 1rem;
    height: 1rem;
    border-radius: 0.5rem;
    z-index: 2;
    transition: 150ms background-color, 150ms transform;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

const switchBarClass = css`
    background-color: ${CSS_COLOR_DEFAULT};
    display: block;
    width: 1.75rem;
    height: 0.75rem;
    border-radius: 0.3775rem;
    z-index: 1;
    transition: 150ms background-color, 150ms opacity;
`

export function Switch({ checked, color, onCheck }: SwitchProps): JSX.Element {
    const color_ = color || CSS_COLOR_PRIMARY
    return (
        <span className={switchClass} onClick={() => onCheck(!checked)}>
            <span
                className={switchButtonContainerClass}
                style={{
                    transform: checked
                        ? "translate(0.75rem, -0.125rem)"
                        : "translate(0, -0.125rem)",
                }}
            >
                <span
                    className={switchButtonClass}
                    style={{
                        backgroundColor: checked ? color_ : CSS_COLOR_DEFAULT_HIGHLIGHT,
                    }}
                />
            </span>
            <span className={switchBarClass} />
        </span>
    )
}
