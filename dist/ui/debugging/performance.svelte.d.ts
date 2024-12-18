import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: Record<string, never>;
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type PerformanceProps = typeof __propDef.props;
export type PerformanceEvents = typeof __propDef.events;
export type PerformanceSlots = typeof __propDef.slots;
export default class Performance extends SvelteComponent<PerformanceProps, PerformanceEvents, PerformanceSlots> {
}
export {};
