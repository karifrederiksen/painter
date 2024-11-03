import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type PerformanceProps = typeof __propDef.props;
export type PerformanceEvents = typeof __propDef.events;
export type PerformanceSlots = typeof __propDef.slots;
export default class Performance extends SvelteComponentTyped<PerformanceProps, PerformanceEvents, PerformanceSlots> {
}
export {};
