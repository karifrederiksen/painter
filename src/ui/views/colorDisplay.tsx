import { Hsv } from "../../data"
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
    height: 1.5rem;
`

const secondaryClass = css`
    width: 30%;
    height: 1.5rem;
`

const primaryClass = css`
    width: 70%;
    height: 1.5rem;
    border-top-right-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
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
