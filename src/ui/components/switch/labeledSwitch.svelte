<script lang="ts">
    import Switch from "./switch.svelte";
    import { InlineLabeled } from "../labeled/index.js";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ change: boolean }>();

    export let label: string;
    export let checked: boolean;

    const bubble = (ev: CustomEvent<boolean>) => {
        dispatch("change", ev.detail);
    };
</script>

<InlineLabeled {label}>
    <Switch {checked} on:change={bubble} />
</InlineLabeled>
