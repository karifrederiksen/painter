import { SvelteComponent } from "svelte";
import type * as Tools from "../../tools/index.js";
declare const __propDef: {
    props: {
        sender: Tools.Sender;
        tool: Tools.Config;
        transientState: {
            readonly isDetailsExpanded: boolean;
        };
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
    exports?: {} | undefined;
    bindings?: string | undefined;
};
export type ToolbarProps = typeof __propDef.props;
export type ToolbarEvents = typeof __propDef.events;
export type ToolbarSlots = typeof __propDef.slots;
export default class Toolbar extends SvelteComponent<ToolbarProps, ToolbarEvents, ToolbarSlots> {
}
export {};
