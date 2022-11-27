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
            onChange={(pct) => sender.setDiameter(pct * 500)}
        />
        <LabeledSlider
            label="Softness"
            value={brush.softness}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.softness}
            onChange={sender.setSoftness}
        />
        <LabeledSlider
            label="Flow"
            value={brush.flowPct}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.flowPct}
            onChange={sender.setOpacity}
        />
        <LabeledSlider
            label="Spacing"
            valuePostfix="%"
            value={brush.spacingPct}
            fromString={stringToFloat}
            toString={toFixed2}
            percentage={brush.spacingPct}
            onChange={sender.setSpacing}
        />
        <LabeledSwitch
            label="Pressure-Opacity"
            checked={brush.pressureAffectsOpacity}
            onCheck={sender.setPressureAffectsOpacity}
        />
        <LabeledSwitch
            label="Pressure-Size"
            checked={brush.pressureAffectsSize}
            onCheck={sender.setPressureAffectsSize}
        />
        <LabeledSlider
            label="Delay"
            valuePostfix="ms"
            value={brush.delay.duration}
            fromString={stringToFloat}
            toString={toFixed0}
            percentage={brush.delay.duration / 500}
            onChange={(pct) => sender.setDelay(pct * 500)}
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
