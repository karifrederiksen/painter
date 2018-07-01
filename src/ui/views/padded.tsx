import { InfernoChildren } from "inferno"

export type PaddedProps = PaddedProps1 | PaddedProps2

export interface PaddedProps1 {
    readonly children: InfernoChildren
    readonly padding: number
}
export interface PaddedProps2 {
    readonly children: InfernoChildren
    readonly paddingX: number
    readonly paddingY: number
}

function isVariant1(props: PaddedProps): props is PaddedProps1 {
    return (props as any)["padding"] !== undefined
}

export function Padded(props: PaddedProps): JSX.Element {
    if (isVariant1(props)) {
        return <div style={{ padding: props.padding + "rem" }}>{props.children}</div>
    }

    const px = props.paddingX + "rem"
    const py = props.paddingY + "rem"
    return (
        <div
            style={{
                paddingLeft: px,
                paddingRight: px,
                paddingTop: py,
                paddingBottom: py,
            }}
        >
            {props.children}
        </div>
    )
}
