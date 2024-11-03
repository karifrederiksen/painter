/** @typedef {typeof __propDef.props}  SurfaceProps */
/** @typedef {typeof __propDef.events}  SurfaceEvents */
/** @typedef {typeof __propDef.slots}  SurfaceSlots */
export default class Surface extends SvelteComponentTyped<{
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
import { SvelteComponentTyped } from "svelte";
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
};
export {};
