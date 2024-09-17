import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        label: string;
        valuePostfix?: string | undefined;
        valueStr: string;
        value: number;
    };
    events: {
        change: CustomEvent<number>;
        changeStr: CustomEvent<string>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export type LabeledSliderProps = typeof __propDef.props;
export type LabeledSliderEvents = typeof __propDef.events;
export type LabeledSliderSlots = typeof __propDef.slots;
export default class LabeledSlider extends SvelteComponentTyped<LabeledSliderProps, LabeledSliderEvents, LabeledSliderSlots> {
}
export {};
