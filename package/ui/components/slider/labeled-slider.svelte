<script>import { createEventDispatcher } from "svelte";
import { Labeled } from "../labeled/index.js";
import Slider from "./slider.svelte";
const dispatch = createEventDispatcher();
export let label;
export let valuePostfix = undefined;
export let valueStr;
export let value;
</script>

<Labeled
    {label}
    {valuePostfix}
    value={valueStr}
    on:change={(ev) => dispatch("changeStr", ev.detail)}
>
    <Slider on:change={(ev) => dispatch("change", ev.detail)} {value} />
</Labeled>
