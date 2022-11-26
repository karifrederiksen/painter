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

  function toFixed2(pct: number): string {
    return pct.toFixed(2);
  }
  function toFixed1(px: number): string {
    return px.toFixed(1);
  }
  function toFixed0(ms: number): string {
    return ms.toFixed(0);
  }
  function onColorText(text: string) {
    const rgb = Color.Rgb.fromCss(text);
    if (rgb === null) {
      return;
    }

    sender.setColor(Color.rgbToHsluv(rgb));
  }
</script>

<Surface>
  <div class="detailsContainer">
    <div style="margin: 0.5rem 0">
      <Menu choices={brush.colorMode} show={colorModeToString} onSelect={sender.setColorMode} />
    </div>
    <ColorWheel color={brush.color} colorType={brush.colorMode.focus} onChange={sender.setColor} />
    <div style="margin: 0.5rem 0">
      <ColorDisplay
        color={brush.color}
        colorSecondary={brush.colorSecondary}
        onClick={sender.swapColorFrom}
      />
    </div>
    <div style="margin: 0.5rem 0">
      <TextInput initialValue={brush.color.toStyle()} onChange={onColorText} />
    </div>
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
    {#if colorType === ColorMode.Hsluv}
      <HsluvSliders {sender} color={brush.color} />
    {:else if colorType === ColorMode.Hsv}
      <HsvSliders {sender} color={Color.rgbToHsv(brush.color.toRgb())} />
    {/if}
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
