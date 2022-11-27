import * as Interp from "./interpolation";
import * as BrushDelay from "./brushDelay";
import type * as BrushShader from "../canvas/brushShader";
import type * as Camera from "./camera";
import * as Color from "color";
import { Vec2, ColorMode, clamp, type Tagged, tagged } from "../util";
import { ZipperList } from "../collections/zipperList";
import type { TransformedPointerInput } from "../canvas";

export type Msg =
    | Tagged<"SetDiameter", { diameterPx: number }>
    | Tagged<"SetSoftness", { softnessPct: number }>
    | Tagged<"SetOpacity", { opacityPct: number }>
    | Tagged<"SetColor", Color.Hsluv>
    | Tagged<"SetColorMode", ColorMode>
    | Tagged<"SetSpacing", { spacingPct: number }>
    | Tagged<"SetPressureAffectsOpacity", boolean>
    | Tagged<"SetPressureAffectsSize", boolean>
    | Tagged<"SwapColor">
    | Tagged<"SetDelay", { delayMs: number }>;

export class Sender {
    constructor(private sendMessage: (msg: Msg) => void) {}

    setColor = (color: Color.Hsluv) => this.sendMessage(tagged("SetColor", color));
    setColorMode = (mode: ColorMode) => this.sendMessage(tagged("SetColorMode", mode));
    setDelay = (delayMs: number) => this.sendMessage(tagged("SetDelay", { delayMs }));
    setDiameter = (diameterPx: number) => this.sendMessage(tagged("SetDiameter", { diameterPx }));
    setOpacity = (opacityPct: number) => this.sendMessage(tagged("SetOpacity", { opacityPct }));
    setSoftness = (softnessPct: number) => this.sendMessage(tagged("SetSoftness", { softnessPct }));
    setSpacing = (spacingPct: number) => this.sendMessage(tagged("SetSpacing", { spacingPct }));
    setPressureAffectsOpacity = (setPressureAffectsOpacity: boolean) =>
        this.sendMessage(tagged("SetPressureAffectsOpacity", setPressureAffectsOpacity));
    setPressureAffectsSize = (setPressureAffectsSize: boolean) =>
        this.sendMessage(tagged("SetPressureAffectsSize", setPressureAffectsSize));
    swapColorFrom = () => this.sendMessage(tagged("SwapColor"));
}

export type State = {
    readonly interpState: Interp.State;
    readonly delayState: BrushDelay.State;
} | null;

export function initTempState(): State {
    return null;
}

export interface Config extends Interp.Config {
    readonly diameterPx: number;
    readonly softness: number;
    readonly flowPct: number;
    readonly colorMode: ZipperList<ColorMode>;
    readonly color: Color.Hsluv;
    readonly colorSecondary: Color.Hsluv;
    readonly spacingPct: number;
    // TODO: I'll want more fine-grained control over _how_ pressure affects things
    //       for that, I'll want some extra stuff: [min, max, interpFunc]
    readonly pressureAffectsOpacity: boolean;
    readonly pressureAffectsSize: boolean;
    readonly delay: BrushDelay.Config;
}

export const init: Config = {
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

export function update(state: Config, msg: Msg): Config {
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
            const never: never = msg;
            throw { "unexpected msg": msg };
        }
    }
}

export function onClick(
    state: Config,
    camera: Camera.Config,
    input: TransformedPointerInput,
): [State, BrushShader.BrushPoint] {
    const brushInput = pointerToBrushInput(input);
    const interpState = Interp.init(createInputPoint(state, brushInput));
    const delayState = BrushDelay.init(input.time, brushInput);
    return [{ interpState, delayState }, createBrushPoint(state, brushInput)];
}

export function onDrag(
    state: Config,
    camera: Camera.Config,
    tempState: State,
    inputs: readonly TransformedPointerInput[],
): [State, readonly BrushShader.BrushPoint[]] {
    if (tempState === null) {
        const res = onClick(state, camera, inputs[0]);
        return [res[0], [res[1]]];
    }

    let interpState: Interp.State = tempState.interpState;
    let brushPoints: readonly BrushShader.BrushPoint[] = [];
    let delayState = tempState.delayState;
    for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        const brushDelayInput = pointerToBrushInput(input);

        const updateResult = BrushDelay.updateWithInput(
            state.delay,
            delayState,
            input.time,
            brushDelayInput,
        );

        const interpReslt = Interp.interpolate(
            interpState,
            state,
            createInputPoint(state, updateResult[1]),
        );
        delayState = updateResult[0];
        interpState = interpReslt[0];
        brushPoints = brushPoints.concat(interpReslt[1]);
    }

    return [{ delayState, interpState }, brushPoints];
}

export function onFrame(
    state: Config,
    ephState: State,
    currentTime: number,
): [State, readonly BrushShader.BrushPoint[]] {
    if (ephState === null) {
        return [null, []];
    }

    const [delayState, newBrushInput] = BrushDelay.update(
        state.delay,
        ephState.delayState,
        currentTime,
    );

    const [interpState, brushPoints] = Interp.interpolate(
        ephState.interpState,
        state,
        createInputPoint(state, newBrushInput),
    );

    return [{ delayState, interpState }, brushPoints];
}

export function onRelease(): [State, readonly BrushShader.BrushPoint[]] {
    return [null, []];
}

function pointerToBrushInput(input: TransformedPointerInput): BrushDelay.Input {
    return new BrushDelay.Input(input.x, input.y, input.pressure);
}

function createBrushPoint(brush: Config, input: BrushDelay.Input): BrushShader.BrushPoint {
    const alpha = brush.flowPct * input.pressure;
    const color =
        alpha === 1
            ? brush.color.toRgb().toLinear()
            : brush.color
                  .toRgb()
                  .toLinear()
                  .mix(1 - alpha, Color.RgbLinear.Black);
    const position = new Vec2(input.x, input.y);
    return {
        alpha,
        color,
        position,
        rotation: 0,
        scaledDiameter: brush.diameterPx * input.pressure,
    };
}

function createInputPoint(brush: Config, input: BrushDelay.Input): Interp.InputPoint {
    const alpha = brush.flowPct * input.pressure;
    const color =
        alpha === 1
            ? brush.color.toRgb().toLinear()
            : brush.color
                  .toRgb()
                  .toLinear()
                  .mix(1 - alpha, Color.RgbLinear.Black);
    const position = new Vec2(input.x, input.y);
    return {
        alpha,
        color,
        position,
        pressure: input.pressure,
        rotation: 0,
    };
}
