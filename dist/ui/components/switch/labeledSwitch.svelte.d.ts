import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        label: string;
        checked: boolean;
    };
    events: {
        change: CustomEvent<boolean>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type LabeledSwitchProps = typeof __propDef.props;
export type LabeledSwitchEvents = typeof __propDef.events;
export type LabeledSwitchSlots = typeof __propDef.slots;
export default class LabeledSwitch extends SvelteComponent<LabeledSwitchProps, LabeledSwitchEvents, LabeledSwitchSlots> {
}
export {};
