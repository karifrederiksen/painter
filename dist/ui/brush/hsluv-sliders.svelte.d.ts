import { SvelteComponent } from "svelte";
import type * as Brush from "../../tools/brush.js";
import type { Hsluv } from "color";
declare const __propDef: {
    props: {
        sender: Brush.Sender;
        color: Hsluv;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type HsluvSlidersProps = typeof __propDef.props;
export type HsluvSlidersEvents = typeof __propDef.events;
export type HsluvSlidersSlots = typeof __propDef.slots;
export default class HsluvSliders extends SvelteComponent<HsluvSlidersProps, HsluvSlidersEvents, HsluvSlidersSlots> {
}
export {};
