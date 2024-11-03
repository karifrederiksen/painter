import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        label: string;
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
export type InlineLabeledProps = typeof __propDef.props;
export type InlineLabeledEvents = typeof __propDef.events;
export type InlineLabeledSlots = typeof __propDef.slots;
export default class InlineLabeled extends SvelteComponent<InlineLabeledProps, InlineLabeledEvents, InlineLabeledSlots> {
}
export {};
