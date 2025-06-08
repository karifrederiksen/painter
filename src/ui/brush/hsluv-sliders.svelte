<script lang="ts">
    import type * as Brush from "../../tools/brush.js";
    import type { Hsluv } from "color";
    import Labeled from "../components/labeled/labeled.svelte";
    import Slider from "../components/slider/slider.svelte";
    import { stringToFloat } from "$lib/util/index.js";

    export let sender: Brush.Sender;
    export let color: Hsluv;

    const sendFloat = (ev: CustomEvent<string>, f: (n: number) => void) => {
        const val = stringToFloat(ev.detail);
        if (val != null) {
            f(val);
        }
    };
</script>

<Labeled
    label="Hue"
    value={color.h.toFixed(2)}
    on:change={(ev) => sendFloat(ev, (h) => sender.setColor(color.with({ h })))}
>
    <Slider value={color.h} on:change={(ev) => sender.setColor(color.with({ h: ev.detail }))} />
</Labeled>
<Labeled
    label="Saturation"
    value={color.s.toFixed(2)}
    on:change={(ev) => sendFloat(ev, (s) => sender.setColor(color.with({ s })))}
>
    <Slider value={color.s} on:change={(ev) => sender.setColor(color.with({ s: ev.detail }))} />
</Labeled>
<Labeled
    label="Luminosity"
    value={color.l.toFixed(2)}
    on:change={(ev) => sendFloat(ev, (l) => sender.setColor(color.with({ l })))}
>
    <Slider value={color.l} on:change={(ev) => sender.setColor(color.with({ l: ev.detail }))} />
</Labeled>
