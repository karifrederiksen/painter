import { SvelteComponentTyped } from "svelte";
import type * as Camera from "../../tools/camera";
declare const __propDef: {
    props: {
        camera: Camera.Config;
        sender: Camera.Sender;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type MiniMapProps = typeof __propDef.props;
export type MiniMapEvents = typeof __propDef.events;
export type MiniMapSlots = typeof __propDef.slots;
export default class MiniMap extends SvelteComponentTyped<MiniMapProps, MiniMapEvents, MiniMapSlots> {
}
export {};
