import { SvelteComponentTyped } from "svelte";
import type { State, Sender } from "../../canvas/layers.js";
declare const __propDef: {
    props: {
        layers: State;
        sender: Sender;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LayersProps = typeof __propDef.props;
export type LayersEvents = typeof __propDef.events;
export type LayersSlots = typeof __propDef.slots;
export default class Layers extends SvelteComponentTyped<LayersProps, LayersEvents, LayersSlots> {
}
export {};
