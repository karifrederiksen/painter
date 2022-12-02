import * as Interp from "./interpolation.js";
import * as BrushDelay from "./brushDelay.js";
import * as Color from "color";
import { Vec2, ColorMode, clamp, tagged } from "../util/index.js";
import { ZipperList } from "../collections/zipperList.js";
export class Sender {
    sendMessage;
    constructor(sendMessage) {
        this.sendMessage = sendMessage;
    }
    setColor = (color) => this.sendMessage(tagged("SetColor", color));
    setColorMode = (mode) => this.sendMessage(tagged("SetColorMode", mode));
    setDelay = (delayMs) => this.sendMessage(tagged("SetDelay", { delayMs }));
    setDiameter = (diameterPx) => this.sendMessage(tagged("SetDiameter", { diameterPx }));
    setOpacity = (opacityPct) => this.sendMessage(tagged("SetOpacity", { opacityPct }));
    setSoftness = (softnessPct) => this.sendMessage(tagged("SetSoftness", { softnessPct }));
    setSpacing = (spacingPct) => this.sendMessage(tagged("SetSpacing", { spacingPct }));
    setPressureAffectsOpacity = (setPressureAffectsOpacity) => this.sendMessage(tagged("SetPressureAffectsOpacity", setPressureAffectsOpacity));
    setPressureAffectsSize = (setPressureAffectsSize) => this.sendMessage(tagged("SetPressureAffectsSize", setPressureAffectsSize));
    swapColorFrom = () => this.sendMessage(tagged("SwapColor"));
}
export function initTempState() {
    return null;
}
export const init = {
    diameterPx: 15,
    softness: 0.4,
    flowPct: 0.3,
    colorMode: ZipperList.unsafeFromArray([ColorMode.Hsluv, ColorMode.Hsv]),
    color: new Color.Hsluv(73, 100, 16),
    colorSecondary: new Color.Hsluv(0, 0, 100),
    spacingPct: 0.05,
    pressureAffectsOpacity: false,
    pressureAffectsSize: true,
    delay: BrushDelay.delay(5),
};
export function update(state, msg) {
    switch (msg.tag) {
        case "SetDiameter":
            return { ...state, diameterPx: clamp(msg.val.diameterPx, 0.1, 500) };
        case "SetSoftness":
            return { ...state, softness: clamp(msg.val.softnessPct, 0, 1) };
        case "SetOpacity":
            return { ...state, flowPct: clamp(msg.val.opacityPct, 0.01, 1) };
        case "SetColor":
            return { ...state, color: msg.val };
        case "SetColorMode":
            return { ...state, colorMode: state.colorMode.focusf((x) => x === msg.val) };
        case "SetSpacing":
            return { ...state, spacingPct: clamp(msg.val.spacingPct, 0.01, 1) };
        case "SetPressureAffectsOpacity":
            return { ...state, pressureAffectsOpacity: msg.val };
        case "SetPressureAffectsSize":
            return { ...state, pressureAffectsSize: msg.val };
        case "SwapColor":
            return { ...state, color: state.colorSecondary, colorSecondary: state.color };
        case "SetDelay":
            return { ...state, delay: BrushDelay.delay(clamp(msg.val.delayMs, 0, 500)) };
        default: {
            const never = msg;
            throw { "unexpected msg": msg };
        }
    }
}
export function onClick(state, camera, input) {
    const brushInput = pointerToBrushInput(input);
    const interpState = Interp.init(createInputPoint(state, brushInput));
    const delayState = BrushDelay.init(input.time, brushInput);
    return [{ interpState, delayState }, createBrushPoint(state, brushInput)];
}
export function onDrag(state, camera, tempState, inputs) {
    if (tempState === null) {
        const res = onClick(state, camera, inputs[0]);
        return [res[0], [res[1]]];
    }
    let interpState = tempState.interpState;
    let brushPoints = [];
    let delayState = tempState.delayState;
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const brushDelayInput = pointerToBrushInput(input);
        const updateResult = BrushDelay.updateWithInput(state.delay, delayState, input.time, brushDelayInput);
        const interpReslt = Interp.interpolate(interpState, state, createInputPoint(state, updateResult[1]));
        delayState = updateResult[0];
        interpState = interpReslt[0];
        brushPoints = brushPoints.concat(interpReslt[1]);
    }
    return [{ delayState, interpState }, brushPoints];
}
export function onFrame(state, ephState, currentTime) {
    if (ephState === null) {
        return [null, []];
    }
    const [delayState, newBrushInput] = BrushDelay.update(state.delay, ephState.delayState, currentTime);
    const [interpState, brushPoints] = Interp.interpolate(ephState.interpState, state, createInputPoint(state, newBrushInput));
    return [{ delayState, interpState }, brushPoints];
}
export function onRelease() {
    return [null, []];
}
function pointerToBrushInput(input) {
    return new BrushDelay.Input(input.x, input.y, input.pressure);
}
function createBrushPoint(brush, input) {
    const alpha = brush.flowPct * input.pressure;
    const color = brush.color.toRgb().toLinear();
    const position = new Vec2(input.x, input.y);
    return {
        alpha,
        color,
        position,
        rotation: 0,
        scaledDiameter: brush.diameterPx * input.pressure,
    };
}
function createInputPoint(brush, input) {
    const alpha = brush.flowPct * input.pressure;
    const color = brush.color.toRgb().toLinear();
    const position = new Vec2(input.x, input.y);
    return {
        alpha,
        color,
        position,
        pressure: input.pressure,
        rotation: 0,
    };
}
