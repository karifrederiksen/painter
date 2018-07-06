import { InfernoChildren } from "inferno"

export function XPadded({ x, children }: { x: number; children: InfernoChildren }): JSX.Element {
    const xStr = x + "rem"
    return <div style={{ paddingLeft: xStr, paddingRight: xStr }}>{children}</div>
}

export function YPadded({ y, children }: { y: number; children: InfernoChildren }): JSX.Element {
    const yStr = y + "rem"
    return <div style={{ paddingTop: yStr, paddingBottom: yStr }}>{children}</div>
}

export function Padded({
    x,
    y,
    children,
}: {
    x: number
    y: number
    children: InfernoChildren
}): JSX.Element {
    const xStr = x + "rem"
    const yStr = y + "rem"
    return (
        <div
            style={{ paddingLeft: xStr, paddingTop: yStr, paddingRight: xStr, paddingBottom: yStr }}
        >
            {children}
        </div>
    )
}
