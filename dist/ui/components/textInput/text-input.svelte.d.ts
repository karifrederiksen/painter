import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        initialValue: string;
        autoFocus?: boolean | undefined;
    };
    events: {
        change: CustomEvent<string>;
        enter: CustomEvent<string>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type TextInputProps = typeof __propDef.props;
export type TextInputEvents = typeof __propDef.events;
export type TextInputSlots = typeof __propDef.slots;
export default class TextInput extends SvelteComponent<TextInputProps, TextInputEvents, TextInputSlots> {
}
export {};
