<script lang="ts">
    import Switch from "./switch.svelte";
    import { InlineLabeled } from "../labeled";

    export let label: string;
    export let checked: boolean;
    export let onCheck: (checked: boolean) => void;
</script>

<InlineLabeled {label}>
    <Switch {checked} {onCheck} />
</InlineLabeled>
