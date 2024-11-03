import { SvelteComponent } from "svelte";
import type * as Eraser from "../../tools/brush.js";
declare const __propDef: {
    props: {
        sender: Eraser.Sender;
        brush: Eraser.Config;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type EraserProps = typeof __propDef.props;
export type EraserEvents = typeof __propDef.events;
export type EraserSlots = typeof __propDef.slots;
export default class Eraser extends SvelteComponent<EraserProps, EraserEvents, EraserSlots> {
}
export {};
