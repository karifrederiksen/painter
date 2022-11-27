<script lang="ts">
    import { Surface, LabeledSlider, LabeledSwitch } from "../components";
    import type * as Eraser from "../../tools/brush";
    import { stringToFloat } from "../../util";

    export let sender: Eraser.Sender;
    export let brush: Eraser.Config;

    function toFixed0(ms: number): string {
        return ms.toFixed(0);
    }
    function toFixed1(px: number): string {
        return px.toFixed(1);
    }
    function toFixed2(pct: number): string {
        return pct.toFixed(2);
    }
</script>

<Surface>
    <div class="detailsContainer">
        <LabeledSlider
            label="Size"
            valuePostfix="px"
            value={brush.diameterPx}
            fromString={stringToFloat}
            toString={toFixed1}
            percentage={brush.diameterPx / 500}
            on:change={(ev) => sender.setDiameter(ev.detail * 500)}
        />
        <LabeledSlider
            label="Softness"
            value={brush.softness}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.softness}
            on:change={(ev) => sender.setSoftness(ev.detail)}
        />
        <LabeledSlider
            label="Flow"
            value={brush.flowPct}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.flowPct}
            on:change={(ev) => sender.setOpacity(ev.detail)}
        />
        <LabeledSlider
            label="Spacing"
            valuePostfix="%"
            value={brush.spacingPct}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.spacingPct}
            on:change={(ev) => sender.setSpacing(ev.detail)}
        />
        <LabeledSwitch
            label="Pressure-Opacity"
            checked={brush.pressureAffectsOpacity}
            on:change={(ev) => sender.setPressureAffectsOpacity(ev.detail)}
        />
        <LabeledSwitch
            label="Pressure-Size"
            checked={brush.pressureAffectsSize}
            on:change={(ev) => sender.setPressureAffectsSize(ev.detail)}
        />
        <LabeledSlider
            label="Delay"
            valuePostfix="ms"
            value={brush.delay.duration}
            fromString={stringToFloat}
            toString={toFixed0}
            percentage={brush.delay.duration / 500}
            on:change={(ev) => sender.setDelay(ev.detail * 500)}
        />
    </div>
</Surface>

<style lang="scss">
    @import "../theme.scss";

    .detailsContainer {
        background-color: $color-surface;
        color: $color-onSurface;
        display: flex;
        flex-direction: column;
        width: 12rem;
        padding: 0.5rem 0.75rem;
        height: 100%;
    }
</style>
