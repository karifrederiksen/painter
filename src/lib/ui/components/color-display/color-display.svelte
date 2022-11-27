<script lang="ts">
    import type { Hsluv } from "color";
    export let color: Hsluv;
    export let colorSecondary: Hsluv;
    export let onClick: () => void;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="container" on:click={onClick}>
    <span class="secondary" style="background-color: {colorSecondary.toStyle()}" />
    <span class="primary" style="background-color: {color.toStyle()}" />
</div>

<style lang="scss">
    .container {
        cursor: pointer;
        display: flex;
        align-items: center;
        width: 100%;
        height: 1rem;
    }

    .secondary {
        width: 25%;
        height: 1rem;
        margin-right: 5%;
        border-top-left-radius: 0.75rem;
        border-bottom-left-radius: 0.75rem;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
    }

    .primary {
        width: 70%;
        height: 1rem;
        border-top-right-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
    }
</style>
