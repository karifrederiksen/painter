import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        spacing: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type RowProps = typeof __propDef.props;
export type RowEvents = typeof __propDef.events;
export type RowSlots = typeof __propDef.slots;
export default class Row extends SvelteComponent<RowProps, RowEvents, RowSlots> {
}
export {};
