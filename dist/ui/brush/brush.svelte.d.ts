import { SvelteComponent } from "svelte";
import type * as Brush from "../../tools/brush.js";
declare const __propDef: {
    props: {
        sender: Brush.Sender;
        brush: Brush.Config;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type BrushProps = typeof __propDef.props;
export type BrushEvents = typeof __propDef.events;
export type BrushSlots = typeof __propDef.slots;
export default class Brush extends SvelteComponent<BrushProps, BrushEvents, BrushSlots> {
}
export {};
