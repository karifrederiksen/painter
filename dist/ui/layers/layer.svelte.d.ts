import { SvelteComponent } from "svelte";
import type { Id, Layer } from "../../canvas/layers.js";
declare const __propDef: {
    props: {
        selectedId: Id;
        layer: Layer;
        onClick: (id: Id) => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type LayerProps = typeof __propDef.props;
export type LayerEvents = typeof __propDef.events;
export type LayerSlots = typeof __propDef.slots;
export default class Layer extends SvelteComponent<LayerProps, LayerEvents, LayerSlots> {
}
export {};
