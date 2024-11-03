/** @typedef {typeof __propDef.props}  SurfaceProps */
/** @typedef {typeof __propDef.events}  SurfaceEvents */
/** @typedef {typeof __propDef.slots}  SurfaceSlots */
export default class Surface extends SvelteComponent<{
    [x: string]: never;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type SurfaceProps = typeof __propDef.props;
export type SurfaceEvents = typeof __propDef.events;
export type SurfaceSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: never;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
    exports?: undefined;
    bindings?: undefined;
};
export {};
