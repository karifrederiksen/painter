<script>import { rgbToHsluv } from "color";
import Labeled from "../components/labeled/labeled.svelte";
import Slider from "../components/slider/slider.svelte";
import { stringToFloat } from "../../util";
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
    on:change={(ev) => sendFloat(ev, (h) => sender.setColor(rgbToHsluv(color.with({ h }).toRgb())))}
>
    <Slider
        value={color.h}
        on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ h: ev.detail }).toRgb()))}
    />
</Labeled>
<Labeled
    label="Saturation"
    value={color.s.toFixed(2)}
    on:change={(ev) => sendFloat(ev, (s) => sender.setColor(rgbToHsluv(color.with({ s }).toRgb())))}
>
    <Slider
        value={color.s}
        on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ s: ev.detail }).toRgb()))}
    />
</Labeled>
<Labeled
    label="Value"
    value={color.v.toFixed(2)}
    on:change={(ev) => sendFloat(ev, (v) => sender.setColor(rgbToHsluv(color.with({ v }).toRgb())))}
>
    <Slider
        value={color.v}
        on:change={(ev) => sender.setColor(rgbToHsluv(color.with({ v: ev.detail }).toRgb()))}
    />
</Labeled>
