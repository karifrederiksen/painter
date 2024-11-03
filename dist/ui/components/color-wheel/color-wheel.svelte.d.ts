import { SvelteComponent } from "svelte";
import * as Color from "color";
import { ColorMode } from "../../../util/index.js";
declare const __propDef: {
    props: {
        color: Color.Hsluv;
        colorType: ColorMode;
    };
    events: {
        colorChange: CustomEvent<Color.Hsluv>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ColorWheelProps = typeof __propDef.props;
export type ColorWheelEvents = typeof __propDef.events;
export type ColorWheelSlots = typeof __propDef.slots;
export default class ColorWheel extends SvelteComponent<ColorWheelProps, ColorWheelEvents, ColorWheelSlots> {
}
export {};
