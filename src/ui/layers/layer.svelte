<script lang="ts">
    import type { Id, Layer } from "../../canvas/layers.js";
    import Surface from "../components/surface/surface.svelte";

    export let selectedId: Id;
    export let layer: Layer;
    export let onClick: (id: Id) => void;

    $: isSelected = selectedId === layer.id;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
    class={isSelected ? "selectedLayerWrapper" : "unselectedLayerWrapper"}
    on:click={() => onClick(layer.id)}
>
    <Surface>
        <div class="layerLeft" />
        <div class="layerRight">
            <div class="layerName">
                {layer.name || "Layer " + layer.id}
            </div>
            <div class="layerOpacity">
                {#if layer.isHidden}
                    Hidden
                {:else}
                    <span>
                        <span>Opacity: </span>
                        <span>{layer.opacity.toFixed(2)}</span>
                    </span>
                {/if}
            </div>
        </div>
    </Surface>
</div>

<style lang="scss">
    @import "../theme.scss";

    .unselectedLayerWrapper {
        cursor: pointer;
        border: 1px solid transparent;

        &:hover {
            border: 1px solid $color-secondaryDark;
        }
    }

    .selectedLayerWrapper {
        border: 1px solid $color-secondary;
    }

    .layerLeft {
        height: 3rem;
        width: 3rem;
        margin-right: 0.5rem;
        background-color: #789;
    }

    .layerRight {
        display: flex;
        flex-direction: column;
        margin-right: 0.5rem;
    }

    .layerName {
        font-size: 1rem;
    }

    .layerOpacity {
        font-size: 0.75rem;
    }
</style>
