import { tagged } from "../util";
export class Sender {
    sendMessage;
    constructor(sendMessage) {
        this.sendMessage = sendMessage;
    }
    setRotation = (rotationTurns) => this.sendMessage(tagged("SetRotation", { rotationTurns: rotationTurns }));
    setOffset = (offsetX, offsetY) => this.sendMessage(tagged("SetOffset", { offsetX, offsetY }));
    setZoom = (zoomPct) => this.sendMessage(tagged("SetZoom", { zoomPct }));
}
export const init = {
    offsetX: 0,
    offsetY: 0,
    zoomPct: 1,
    rotateTurns: 0,
};
export function update(state, msg) {
    switch (msg.tag) {
        case "SetZoom":
            return { ...state, zoomPct: Math.max(0.01, msg.val.zoomPct) };
        case "SetOffset":
            return { ...state, offsetX: msg.val.offsetX, offsetY: msg.val.offsetY };
        case "SetRotation":
            return { ...state, rotateTurns: msg.val.rotationTurns };
        default: {
            const never = msg;
            throw { "unexpected msg": msg };
        }
    }
}
export function zoomUpdate(state, dragState, input) {
    const xd = input.x - dragState.clickPoint.x;
    let addedPct = xd / 500;
    if (addedPct >= 0) {
        addedPct = addedPct ** 2;
    }
    else {
        addedPct = -((-addedPct) ** 2);
    }
    const zoomPct = dragState.originalScale + addedPct;
    return { ...state, zoomPct: Math.min(5000, zoomPct) };
}
export function rotateUpdate(state, dragState, input) {
    throw new Error("todo: should be turns, not rad");
    // const rotationRad = Math.atan2(
    //     input.y - dragState.clickPoint.y,
    //     input.x - dragState.clickPoint.x
    // )
    // return new State(this.offsetX, this.offsetY, this.zoomPct, rotationRad)
}
export function moveUpdate(state, dragState, input) {
    const xd = input.x - dragState.prevPoint.x;
    const yd = input.y - dragState.prevPoint.y;
    return { ...state, offsetX: state.offsetX + xd, offsetY: state.offsetY + yd };
}
