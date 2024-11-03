import { SvelteComponent } from "svelte";
import type { Hsluv } from "color";
declare const __propDef: {
    props: {
        color: Hsluv;
        colorSecondary: Hsluv;
    };
    events: {
        click: CustomEvent<undefined>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ColorDisplayProps = typeof __propDef.props;
export type ColorDisplayEvents = typeof __propDef.events;
export type ColorDisplaySlots = typeof __propDef.slots;
export default class ColorDisplay extends SvelteComponent<ColorDisplayProps, ColorDisplayEvents, ColorDisplaySlots> {
}
export {};
