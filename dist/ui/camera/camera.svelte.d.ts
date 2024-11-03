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
export type CameraProps = typeof __propDef.props;
export type CameraEvents = typeof __propDef.events;
export type CameraSlots = typeof __propDef.slots;
export default class Camera extends SvelteComponent<CameraProps, CameraEvents, CameraSlots> {
}
export {};
