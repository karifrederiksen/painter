<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Labeled } from "../labeled";
    import Slider from "./slider.svelte";

    const dispatch = createEventDispatcher<{ change: number; changeStr: string }>();

    export let label: string;
    export let valuePostfix: string | undefined = undefined;
    export let valueStr: string;
    export let value: number;
</script>

<Labeled
    {label}
    {valuePostfix}
    value={valueStr}
    on:change={(ev) => dispatch("changeStr", ev.detail)}
>
    <Slider on:change={(ev) => dispatch("change", ev.detail)} {value} />
</Labeled>
