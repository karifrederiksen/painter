<script>import Labeled from "../components/labeled/labeled.svelte";
import Slider from "../components/slider/slider.svelte";
import { stringToFloat } from "../../util/index.js";
export let sender;
export let color;
const sendFloat = (ev, f) => {
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
