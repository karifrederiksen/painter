import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        label: string;
        valuePostfix?: string | undefined;
        value?: string | undefined;
    };
    events: {
        change: CustomEvent<string>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type LabeledProps = typeof __propDef.props;
export type LabeledEvents = typeof __propDef.events;
export type LabeledSlots = typeof __propDef.slots;
export default class Labeled extends SvelteComponentTyped<LabeledProps, LabeledEvents, LabeledSlots> {
}
export {};
