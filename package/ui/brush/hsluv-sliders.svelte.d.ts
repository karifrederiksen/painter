import { SvelteComponentTyped } from "svelte";
import type * as Brush from "../../tools/brush";
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
};
export type HsluvSlidersProps = typeof __propDef.props;
export type HsluvSlidersEvents = typeof __propDef.events;
export type HsluvSlidersSlots = typeof __propDef.slots;
export default class HsluvSliders extends SvelteComponentTyped<HsluvSlidersProps, HsluvSlidersEvents, HsluvSlidersSlots> {
}
export {};
