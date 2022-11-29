<script lang="ts">
    import {
        Menu,
        ColorWheel,
        ColorDisplay,
        Surface,
        Labeled,
        InlineLabeled,
        Slider,
        Switch,
        TextInput,
    } from "../components/index.js";
    import type * as Brush from "../../tools/brush.js";
    import * as Color from "color";
    import { ColorMode, colorModeToString, stringToFloat } from "$lib/util/index.js";
    import HsluvSliders from "./hsluv-sliders.svelte";
    import HsvSliders from "./hsv-sliders.svelte";

    export let sender: Brush.Sender;
    export let brush: Brush.Config;

    $: colorType = brush.colorMode.focus;

    const sendFloat = (ev: CustomEvent<string>, f: (n: number) => void) => {
        const val = stringToFloat(ev.detail);
        if (val != null) {
            f(val);
        }
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
                on:select={(ev) => sender.setColorMode(ev.detail)}
            />
        </div>
        <ColorWheel
            color={brush.color}
            colorType={brush.colorMode.focus}
            on:colorChange={(ev) => sender.setColor(ev.detail)}
        />
        <div style="margin: 0.5rem 0">
            <ColorDisplay
                color={brush.color}
                colorSecondary={brush.colorSecondary}
                on:click={sender.swapColorFrom}
            />
        </div>
        <div style="margin: 0.5rem 0">
            <TextInput
                initialValue={brush.color.toStyle()}
                on:enter={(ev) => onColorText(ev.detail)}
            />
        </div>
        <Labeled
            label="Size"
            valuePostfix=" px"
            value={brush.diameterPx.toFixed(1)}
            on:change={(ev) => sendFloat(ev, sender.setDiameter)}
        >
            <Slider
                value={brush.diameterPx / 500}
                on:change={(ev) => sender.setDiameter(ev.detail * 500)}
            />
        </Labeled>
        <Labeled
            label="Softness"
            value={brush.softness.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setSoftness)}
        >
            <Slider value={brush.softness} on:change={(ev) => sender.setSoftness(ev.detail)} />
        </Labeled>
        <Labeled
            label="Flow"
            value={brush.flowPct.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setOpacity)}
        >
            <Slider value={brush.flowPct} on:change={(ev) => sender.setOpacity(ev.detail)} />
        </Labeled>
        <Labeled
            label="Spacing"
            valuePostfix="%"
            value={brush.spacingPct.toFixed(2)}
            on:change={(ev) => sendFloat(ev, sender.setSpacing)}
        >
            <Slider value={brush.spacingPct} on:change={(ev) => sender.setSpacing(ev.detail)} />
        </Labeled>
        {#if colorType === ColorMode.Hsluv}
            <HsluvSliders {sender} color={brush.color} />
        {:else if colorType === ColorMode.Hsv}
            <HsvSliders {sender} color={Color.rgbToHsv(brush.color.toRgb())} />
        {/if}
        <InlineLabeled label="Pressure-Opacity">
            <Switch
                checked={brush.pressureAffectsOpacity}
                on:change={(ev) => sender.setPressureAffectsOpacity(ev.detail)}
            />
        </InlineLabeled>
        <InlineLabeled label="Pressure-Size">
            <Switch
                checked={brush.pressureAffectsSize}
                on:change={(ev) => sender.setPressureAffectsSize(ev.detail)}
            />
        </InlineLabeled>
        <Labeled
            label="Delay"
            valuePostfix="ms"
            value={brush.delay.duration.toFixed(0)}
            on:change={(ev) => sendFloat(ev, sender.setDelay)}
        >
            <Slider
                value={brush.delay.duration / 500}
                on:change={(ev) => sender.setDelay(ev.detail * 500)}
            />
        </Labeled>
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
