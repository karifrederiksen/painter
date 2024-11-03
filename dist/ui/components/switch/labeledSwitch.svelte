<script>import Switch from "./switch.svelte";
import { InlineLabeled } from "../labeled/index.js";
import { createEventDispatcher } from "svelte";
const dispatch = createEventDispatcher();
export let label;
export let checked;
const bubble = (ev) => {
  dispatch("change", ev.detail);
};
</script>

<InlineLabeled {label}>
    <Switch {checked} on:change={bubble} />
</InlineLabeled>
