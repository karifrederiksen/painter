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
export type CameraProps = typeof __propDef.props;
export type CameraEvents = typeof __propDef.events;
export type CameraSlots = typeof __propDef.slots;
export default class Camera extends SvelteComponentTyped<CameraProps, CameraEvents, CameraSlots> {
}
export {};
