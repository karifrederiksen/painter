import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        checked: boolean;
    };
    events: {
        change: CustomEvent<boolean>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type SwitchProps = typeof __propDef.props;
export type SwitchEvents = typeof __propDef.events;
export type SwitchSlots = typeof __propDef.slots;
export default class Switch extends SvelteComponentTyped<SwitchProps, SwitchEvents, SwitchSlots> {
}
export {};
