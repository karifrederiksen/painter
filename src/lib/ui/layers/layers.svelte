<script lang="ts">
    import type { State, Sender } from "../../canvas/layers";
    import { Row, DefaultButton, Surface, Labeled, Slider, Switch } from "../components";
    import { stringToFloat } from "$lib/util";
    import LayerComponent from "./layer.svelte";

    export let layers: State;
    export let sender: Sender;

    $: topLayers = layers.layers.children;
    $: current = layers.current();

    const sendFloat = (ev: CustomEvent<string>, f: (n: number) => void) => {
        const val = stringToFloat(ev.detail);
        if (val != null) {
            f(val);
        }
    };
</script>

<div class="layersWrapper">
    <Surface>
        <div class="layersControlsWrapper">
            <Row spacing={0.25}>
                <DefaultButton on:click={() => sender.newLayer(current.id)} title="New layer">
                    New
                </DefaultButton>
                <DefaultButton on:click={() => sender.removeLayer(current.id)} title="Delete layer">
                    Delete
                </DefaultButton>
            </Row>
            <Labeled label="Hidden">
                <Switch
                    checked={current.isHidden}
                    on:change={(ev) => sender.setHidden(current.id, ev.detail)}
                />
            </Labeled>
            <Labeled
                label="Opacity"
                value={current.opacity.toFixed(2)}
                on:change={(ev) => sendFloat(ev, (n) => sender.setOpacity(current.id, n))}
            >
                <Slider
                    value={current.opacity}
                    on:change={(ev) => sender.setOpacity(current.id, ev.detail)}
                />
            </Labeled>
        </div>
    </Surface>
    <div class="layersListWrapper">
        {#each topLayers as layer}
            <LayerComponent
                {layer}
                selectedId={current.id}
                onClick={(id) => sender.selectLayer(id)}
            />
        {/each}
    </div>
</div>

<style lang="scss">
    @import "../theme.scss";

    .layersWrapper {
        height: fit-content;
    }

    .layersListWrapper {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        padding: 0.5rem 0.25rem;
    }

    .layersControlsWrapper {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        padding-top: 0.5rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
        width: 100%;
    }
</style>
