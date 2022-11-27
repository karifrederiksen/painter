<script lang="ts">
    import {
        Menu,
        ColorWheel,
        ColorDisplay,
        Surface,
        LabeledSlider,
        LabeledSwitch,
        TextInput,
    } from "../components";
    import type * as Brush from "../../tools/brush";
    import * as Color from "color";
    import { ColorMode, colorModeToString, stringToFloat } from "../../util";
    import HsluvSliders from "./hsluv-sliders.svelte";
    import HsvSliders from "./hsv-sliders.svelte";

    export let sender: Brush.Sender;
    export let brush: Brush.Config;

    $: colorType = brush.colorMode.focus;

    const toFixed2 = (pct: number): string => {
        return pct.toFixed(2);
    };
    const toFixed1 = (px: number): string => {
        return px.toFixed(1);
    };
    const toFixed0 = (ms: number): string => {
        return ms.toFixed(0);
    };
    const onColorText = (text: string) => {
        const rgb = Color.Rgb.fromCss(text);
        if (rgb === null) {
            return;
        }

        sender.setColor(Color.rgbToHsluv(rgb));
    };
</script>

<Surface>
    <div class="detailsContainer">
        <div style="margin: 0.5rem 0">
            <Menu
                choices={brush.colorMode}
                show={colorModeToString}
                onSelect={sender.setColorMode}
            />
        </div>
        <ColorWheel
            color={brush.color}
            colorType={brush.colorMode.focus}
            onChange={sender.setColor}
        />
        <div style="margin: 0.5rem 0">
            <ColorDisplay
                color={brush.color}
                colorSecondary={brush.colorSecondary}
                onClick={sender.swapColorFrom}
            />
        </div>
        <div style="margin: 0.5rem 0">
            <TextInput initialValue={brush.color.toStyle()} onEnter={onColorText} />
        </div>
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
            toString={(pct) => {
                return pct.toFixed(2);
            }}
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
        {#if colorType === ColorMode.Hsluv}
            <HsluvSliders {sender} color={brush.color} />
        {:else if colorType === ColorMode.Hsv}
            <HsvSliders {sender} color={Color.rgbToHsv(brush.color.toRgb())} />
        {/if}
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
