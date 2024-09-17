import { SvelteComponentTyped } from "svelte";
import type { Config, Sender } from "../../canvas/index.js";
declare const __propDef: {
    props: {
        config: Config;
        sender: Sender;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type DebugWindowProps = typeof __propDef.props;
export type DebugWindowEvents = typeof __propDef.events;
export type DebugWindowSlots = typeof __propDef.slots;
export default class DebugWindow extends SvelteComponentTyped<DebugWindowProps, DebugWindowEvents, DebugWindowSlots> {
}
export {};
