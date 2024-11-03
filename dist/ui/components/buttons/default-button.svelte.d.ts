import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        title?: string | undefined;
        style?: string | undefined;
    };
    events: {
        click: CustomEvent<undefined>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export type DefaultButtonProps = typeof __propDef.props;
export type DefaultButtonEvents = typeof __propDef.events;
export type DefaultButtonSlots = typeof __propDef.slots;
export default class DefaultButton extends SvelteComponentTyped<DefaultButtonProps, DefaultButtonEvents, DefaultButtonSlots> {
}
export {};
