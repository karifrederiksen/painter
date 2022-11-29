import { SvelteComponentTyped } from "svelte";
import type * as Brush from "../../tools/brush";
import { type Hsv } from "color";
declare const __propDef: {
    props: {
        sender: Brush.Sender;
        color: Hsv;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type HsvSlidersProps = typeof __propDef.props;
export type HsvSlidersEvents = typeof __propDef.events;
export type HsvSlidersSlots = typeof __propDef.slots;
export default class HsvSliders extends SvelteComponentTyped<HsvSlidersProps, HsvSlidersEvents, HsvSlidersSlots> {
}
export {};
