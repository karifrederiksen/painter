import { Msg, Rgb } from "../../../data"

export const enum BrushMsgType {
    SetDiameter,
    SetOpacity,
    SetColor,
    SetSpacing,
    SetPressureAffectsOpacity,
    SetPressureAffectsSize,
    SwapColorFrom,
    SetDelay,
}

export type BrushMsg =
    | Msg<BrushMsgType.SetDiameter, number>
    | Msg<BrushMsgType.SetOpacity, number>
    | Msg<BrushMsgType.SetColor, Rgb>
    | Msg<BrushMsgType.SetSpacing, number>
    | Msg<BrushMsgType.SetPressureAffectsOpacity, boolean>
    | Msg<BrushMsgType.SetPressureAffectsSize, boolean>
    | Msg<BrushMsgType.SwapColorFrom, Rgb>
    | Msg<BrushMsgType.SetDelay, number>

export function setDiameter(px: number): BrushMsg {
    return { type: BrushMsgType.SetDiameter, payload: px }
}

export function setOpacity(opacity: number): BrushMsg {
    return { type: BrushMsgType.SetOpacity, payload: opacity }
}

export function setColor(color: Rgb): BrushMsg {
    return { type: BrushMsgType.SetColor, payload: color }
}

export function setSpacing(spacing: number): BrushMsg {
    return { type: BrushMsgType.SetSpacing, payload: spacing }
}

export function setPressureAffectsOpacity(pressureAffectsOpacity: boolean): BrushMsg {
    return { type: BrushMsgType.SetPressureAffectsOpacity, payload: pressureAffectsOpacity }
}

export function setPressureAffectsSize(pressureAffectsSize: boolean): BrushMsg {
    return { type: BrushMsgType.SetPressureAffectsSize, payload: pressureAffectsSize }
}

export function SwapColorFrom(previousColor: Rgb): BrushMsg {
    return { type: BrushMsgType.SwapColorFrom, payload: previousColor }
}

export function setDelay(ms: number): BrushMsg {
    return { type: BrushMsgType.SetDelay, payload: ms }
}
