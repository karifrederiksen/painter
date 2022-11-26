<script lang="ts">
  import type * as Brush from "../../tools/brush";
  import { type Hsv, rgbToHsluv } from "color";
  import LabeledSlider from "../components/slider/labeled-slider.svelte";
  import { stringToFloat } from "$lib/util";

  export let sender: Brush.Sender;
  export let color: Hsv;

  function toFixed2(pct: number): string {
    return pct.toFixed(2);
  }
</script>

<LabeledSlider
  label="Hue"
  value={color.h}
  fromString={stringToFloat}
  toString={toFixed2}
  percentage={color.h}
  onChange={(pct) => sender.setColor(rgbToHsluv(color.with({ h: pct }).toRgb()))}
/>
<LabeledSlider
  label="Saturation"
  value={color.s}
  fromString={stringToFloat}
  toString={toFixed2}
  percentage={color.s}
  onChange={(pct) => sender.setColor(rgbToHsluv(color.with({ s: pct }).toRgb()))}
/>
<LabeledSlider
  label="Value"
  value={color.v}
  fromString={stringToFloat}
  toString={toFixed2}
  percentage={color.v}
  onChange={(pct) => sender.setColor(rgbToHsluv(color.with({ v: pct }).toRgb()))}
/>
