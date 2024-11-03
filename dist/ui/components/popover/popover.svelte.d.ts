import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        text: string;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type PopoverProps = typeof __propDef.props;
export type PopoverEvents = typeof __propDef.events;
export type PopoverSlots = typeof __propDef.slots;
export default class Popover extends SvelteComponentTyped<PopoverProps, PopoverEvents, PopoverSlots> {
}
export {};
