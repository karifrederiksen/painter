import { SvelteComponentTyped } from "svelte";
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
};
export type RowProps = typeof __propDef.props;
export type RowEvents = typeof __propDef.events;
export type RowSlots = typeof __propDef.slots;
export default class Row extends SvelteComponentTyped<RowProps, RowEvents, RowSlots> {
}
export {};
