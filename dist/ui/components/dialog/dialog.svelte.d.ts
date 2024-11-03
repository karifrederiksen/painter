import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        isOpen: boolean;
        onClose: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        body: {};
        footer: {};
    };
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type DialogProps = typeof __propDef.props;
export type DialogEvents = typeof __propDef.events;
export type DialogSlots = typeof __propDef.slots;
export default class Dialog extends SvelteComponent<DialogProps, DialogEvents, DialogSlots> {
}
export {};
