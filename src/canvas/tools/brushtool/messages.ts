import { Msg, Hsv } from "../../../data"

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
    | Msg<BrushMsgType.SetColor, Hsv>
    | Msg<BrushMsgType.SetSpacing, number>
    | Msg<BrushMsgType.SetPressureAffectsOpacity, boolean>
    | Msg<BrushMsgType.SetPressureAffectsSize, boolean>
    | Msg<BrushMsgType.SwapColorFrom, Hsv>
    | Msg<BrushMsgType.SetDelay, number>

export interface BrushMessageSender {
    setColor(color: Hsv): void
    setDelay(ms: number): void
    setDiameter(px: number): void
    setOpacity(opacity: number): void
    setSpacing(px: number): void
    setPressureAffectsOpacity(setPressureAffectsOpacity: boolean): void
    setPressureAffectsSize(setPressureAffectsSize: boolean): void
    swapColorFrom(previousColor: Hsv): void
}

export function createBrushSender(sendMessage: (msg: BrushMsg) => void): BrushMessageSender {
    return {
        setColor: color => sendMessage({ type: BrushMsgType.SetColor, payload: color }),
        setDelay: ms => sendMessage({ type: BrushMsgType.SetDelay, payload: ms }),
        setDiameter: px => sendMessage({ type: BrushMsgType.SetDiameter, payload: px }),
        setOpacity: pct => sendMessage({ type: BrushMsgType.SetOpacity, payload: pct }),
        setSpacing: px => sendMessage({ type: BrushMsgType.SetSpacing, payload: px }),
        setPressureAffectsOpacity: x =>
            sendMessage({ type: BrushMsgType.SetPressureAffectsOpacity, payload: x }),
        setPressureAffectsSize: x =>
            sendMessage({ type: BrushMsgType.SetPressureAffectsSize, payload: x }),
        swapColorFrom: prevColor =>
            sendMessage({ type: BrushMsgType.SwapColorFrom, payload: prevColor }),
    }
}
