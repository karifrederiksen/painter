import { SvelteComponent } from "svelte";
import type * as Camera from "../../tools/camera.js";
declare const __propDef: {
    props: {
        camera: Camera.Config;
        sender: Camera.Sender;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type MiniMapProps = typeof __propDef.props;
export type MiniMapEvents = typeof __propDef.events;
export type MiniMapSlots = typeof __propDef.slots;
export default class MiniMap extends SvelteComponent<MiniMapProps, MiniMapEvents, MiniMapSlots> {
}
export {};
