import { SvelteComponent } from "svelte";
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
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type PrimaryButtonProps = typeof __propDef.props;
export type PrimaryButtonEvents = typeof __propDef.events;
export type PrimaryButtonSlots = typeof __propDef.slots;
export default class PrimaryButton extends SvelteComponent<PrimaryButtonProps, PrimaryButtonEvents, PrimaryButtonSlots> {
}
export {};
