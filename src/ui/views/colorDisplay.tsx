import { Hsv } from "core"
import { css } from "emotion"

export type ColorDisplay = {
    readonly color: Hsv
    readonly colorSecondary: Hsv
    readonly onClick: () => void
}

const wrapperClass = css`
    cursor: pointer;
    display: flex;
    align-items: center;
    width: 100%;
    height: 1rem;
`

const secondaryClass = css`
    width: 25%;
    height: 1rem;
    margin-right: 5%;
    border-top-left-radius: 0.75rem;
    border-bottom-left-radius: 0.75rem;
    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2), 0 4px 2px 0 rgba(0, 0, 0, 0.14),
        0 6px 1px -2px rgba(0, 0, 0, 0.12);
`

const primaryClass = css`
    width: 70%;
    height: 1rem;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
        0 3px 1px -2px rgba(0, 0, 0, 0.12);
`

export function ColorDisplay({ color, colorSecondary, onClick }: ColorDisplay): JSX.Element {
    return (
        <div className={wrapperClass} onClick={onClick}>
            <span
                className={secondaryClass}
                style={{
                    backgroundColor: colorSecondary.toRgb().toCss(),
                }}
            />
            <span
                className={primaryClass}
                style={{
                    backgroundColor: color.toRgb().toCss(),
                }}
            />
        </div>
    )
}
