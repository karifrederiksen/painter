<script>import Surface from "../components/surface/surface.svelte";
export let selectedId;
export let layer;
export let onClick;
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

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.unselectedLayerWrapper {
  cursor: pointer;
  border: 1px solid transparent;
}
.unselectedLayerWrapper:hover {
  border: 1px solid var(--color-secondaryDark);
}

.selectedLayerWrapper {
  border: 1px solid var(--color-secondary);
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
}</style>
