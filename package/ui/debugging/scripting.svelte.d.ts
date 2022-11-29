import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type ScriptingProps = typeof __propDef.props;
export type ScriptingEvents = typeof __propDef.events;
export type ScriptingSlots = typeof __propDef.slots;
export default class Scripting extends SvelteComponentTyped<ScriptingProps, ScriptingEvents, ScriptingSlots> {
}
export {};
