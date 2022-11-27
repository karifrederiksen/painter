<script lang="ts">
    import type * as Brush from "../../tools/brush";
    import type { Hsluv } from "color";
    import LabeledSlider from "../components/slider/labeled-slider.svelte";
    import { stringToFloat } from "$lib/util";

    export let sender: Brush.Sender;
    export let color: Hsluv;

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
    on:change={(ev) => sender.setColor(color.with({ h: ev.detail }))}
/>
<LabeledSlider
    label="Saturation"
    value={color.s}
    fromString={stringToFloat}
    toString={toFixed2}
    percentage={color.s}
    on:change={(ev) => sender.setColor(color.with({ s: ev.detail }))}
/>
<LabeledSlider
    label="Luminosity"
    value={color.l}
    fromString={stringToFloat}
    toString={toFixed2}
    percentage={color.l}
    on:change={(ev) => sender.setColor(color.with({ l: ev.detail }))}
/>
