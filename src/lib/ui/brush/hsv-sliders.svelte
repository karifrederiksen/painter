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
    on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ h: ev.detail }).toRgb()))}
/>
<LabeledSlider
    label="Saturation"
    value={color.s}
    fromString={stringToFloat}
    toString={toFixed2}
    percentage={color.s}
    on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ s: ev.detail }).toRgb()))}
/>
<LabeledSlider
    label="Value"
    value={color.v}
    fromString={stringToFloat}
    toString={toFixed2}
    percentage={color.v}
    on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ v: ev.detail }).toRgb()))}
/>
