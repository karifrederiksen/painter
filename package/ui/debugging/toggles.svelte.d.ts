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
export type TogglesProps = typeof __propDef.props;
export type TogglesEvents = typeof __propDef.events;
export type TogglesSlots = typeof __propDef.slots;
export default class Toggles extends SvelteComponentTyped<TogglesProps, TogglesEvents, TogglesSlots> {
}
export {};