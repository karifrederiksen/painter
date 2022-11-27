<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Labeled } from "../labeled";
    import Slider from "./slider.svelte";

    const dispatch = createEventDispatcher<{ change: number }>();

    export let label: string;
    export let valuePostfix: string | undefined = undefined;
    export let value: number;
    export let toString: (value: number) => string;
    export let fromString: (text: string) => number | null;
    export let percentage: number;

    const bubble = (ev: CustomEvent<number>) => {
        dispatch("change", ev.detail);
    };
</script>

<Labeled {label} {valuePostfix} {value} {toString} {fromString} on:change={bubble}>
    <Slider on:change={bubble} {percentage} />
</Labeled>
