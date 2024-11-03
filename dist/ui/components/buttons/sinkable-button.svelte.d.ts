import { SvelteComponentTyped } from "svelte";
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
};
export type SinkableButtonProps = typeof __propDef.props;
export type SinkableButtonEvents = typeof __propDef.events;
export type SinkableButtonSlots = typeof __propDef.slots;
export default class SinkableButton extends SvelteComponentTyped<SinkableButtonProps, SinkableButtonEvents, SinkableButtonSlots> {
}
export {};
