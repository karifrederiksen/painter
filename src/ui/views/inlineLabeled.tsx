import { VNode } from "inferno"
import { css } from "emotion"

export type InlineLabeledProps = {
    readonly label: string
    readonly children: VNode | Element
}

const containerClass = css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;
    margin: 0.25rem 0;
    width: 100%;
`

const labelClass = css`
    color: inherit;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
`

export function InlineLabeled({ children, label }: InlineLabeledProps): JSX.Element {
    return (
        <div className={containerClass}>
            <div className={labelClass}>{label}</div>
            {children}
        </div>
    )
}
