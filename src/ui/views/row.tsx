import { css } from "emotion"
import { InfernoChildren, VNode } from "inferno"

export interface RowProps {
    readonly spacing?: string
    readonly children: ReadonlyArray<VNode | string>
}

const rowClass = css`
    display: flex;
    flex-direction: row;
`

const colClass = css`
    width: 100%;
`

export function Row({ spacing, children }: RowProps): JSX.Element {
    spacing = spacing || "0"
    const spacedChildren = new Array<VNode | string>(children.length)

    if (children.length > 0) {
        spacedChildren[0] = <div className={colClass}>{children[0]}</div>
        for (let i = 1; i < children.length; i++) {
            spacedChildren[i] = (
                <div className={colClass} style={{ marginLeft: spacing }}>
                    {children[i]}
                </div>
            )
        }
    }

    return <div className={rowClass}>{spacedChildren}</div>
}
