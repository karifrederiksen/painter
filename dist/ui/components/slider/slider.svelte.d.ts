import { SvelteComponentTyped } from "svelte";
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
};
export type SliderProps = typeof __propDef.props;
export type SliderEvents = typeof __propDef.events;
export type SliderSlots = typeof __propDef.slots;
export default class Slider extends SvelteComponentTyped<SliderProps, SliderEvents, SliderSlots> {
}
export {};
