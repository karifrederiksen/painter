import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        title?: string | undefined;
        isDown: boolean;
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
export type SinkableButtonProps = typeof __propDef.props;
export type SinkableButtonEvents = typeof __propDef.events;
export type SinkableButtonSlots = typeof __propDef.slots;
export default class SinkableButton extends SvelteComponent<SinkableButtonProps, SinkableButtonEvents, SinkableButtonSlots> {
}
export {};
