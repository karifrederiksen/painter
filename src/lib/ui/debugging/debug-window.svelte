<script lang="ts">
    import DefaultButton from "../components/buttons/default-button.svelte";
    import Surface from "../components/surface/surface.svelte";
    import Performance from "./performance.svelte";
    import Scripting from "./scripting.svelte";
    import { canvasEphemeral } from "../state";

    $: themeRng = $canvasEphemeral?.themeRng;

    let isOpen = false;

    function open() {
        isOpen = true;
    }

    function close() {
        isOpen = false;
    }
</script>

<Surface {isOpen}>
    {#if isOpen}
        <div class="container">
            <DefaultButton onClick={close}>Close</DefaultButton>
            <div class="contentContainer">
                RNG: <div class="monospaced">{themeRng.display()}</div>
                <Performance />
                <Scripting />
            </div>
        </div>
    {:else}
        <DefaultButton onClick={open}>Debug</DefaultButton>
    {/if}
</Surface>

<style lang="scss">
    @import "../theme.scss";

    .container {
        z-index: 100;
        display: flex;
        padding: 0.5rem 1rem;
    }

    .contentContainer {
        padding-left: 1rem;
    }

    .monospaced {
        font-family: $fonts-monospace;
    }
</style>
