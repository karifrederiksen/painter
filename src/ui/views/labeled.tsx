import { VNode } from "inferno"
import { css } from "emotion"

export type LabeledProps = {
    readonly label: string
    readonly value?: string
    readonly children: VNode | Element
}

const containerClass = css`
    color: inherit;
    margin: 0.5rem 0;
    width: 100%;
`

const labelClass = css`
    color: inherit;
    margin-bottom: 0.25rem;
`

const contentClass = css`
    width: 100%;
`

const textContainer = css`
    display: flex;
    justify-content: space-between;
    color: inherit;
`

export function Labeled({ children, label, value }: LabeledProps): JSX.Element {
    return (
        <div className={containerClass}>
            <div className={textContainer}>
                <p className={labelClass}>{label}</p>
                <p className={labelClass}>{value}</p>
            </div>
            <div className={contentClass}>{children}</div>
        </div>
    )
}
