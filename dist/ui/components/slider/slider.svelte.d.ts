import { SvelteComponent } from "svelte";
import type { Hsv } from "color";
declare const __propDef: {
    props: {
        value: number;
        color?: Hsv | undefined;
    };
    events: {
        change: CustomEvent<number>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type SliderProps = typeof __propDef.props;
export type SliderEvents = typeof __propDef.events;
export type SliderSlots = typeof __propDef.slots;
export default class Slider extends SvelteComponent<SliderProps, SliderEvents, SliderSlots> {
}
export {};
