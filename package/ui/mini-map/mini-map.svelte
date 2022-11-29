<script>import { clamp, stringToFloat } from "../../util/index.js";
import Slider from "../components/slider/slider.svelte";
import Labeled from "../components/labeled/labeled.svelte";
const zoomToString = (pct) => {
    return (pct * 100).toFixed(2);
};
const rotateToString = (pct) => {
    return (pct * 360).toFixed(1);
};
const sendFloat = (ev, f) => {
    const val = stringToFloat(ev.detail);
    if (val != null) {
        f(val);
    }
};
export let camera;
export let sender;
</script>

<div class="container">
    <Labeled
        label="Zoom"
        valuePostfix="%"
        value={zoomToString(camera.zoomPct)}
        on:change={(ev) => {
            sendFloat(ev, sender.setZoom);
        }}
    >
        <Slider
            value={camera.zoomPct / 4}
            on:change={(ev) => {
                sender.setRotation(ev.detail * 4);
            }}
        />
    </Labeled>
    <Labeled
        label="Rotate"
        valuePostfix=" deg"
        value={rotateToString(camera.rotateTurns)}
        on:change={(ev) => {
            sendFloat(ev, sender.setRotation);
        }}
    >
        <Slider
            value={camera.rotateTurns}
            on:change={(ev) => {
                sender.setRotation(ev.detail);
            }}
        />
    </Labeled>
    <Labeled
        label="Offset X"
        valuePostfix=" px"
        value={camera.offsetX.toFixed(0)}
        on:change={(ev) => {
            sendFloat(ev, (n) => sender.setOffset(n, camera.offsetY));
        }}
    >
        <Slider
            value={clamp((camera.offsetX + 2500) / 5000, -5000, 5000)}
            on:change={(ev) => {
                sender.setOffset(ev.detail * 5000 - 2500, camera.offsetY);
            }}
        />
    </Labeled>
    <Labeled
        label="Offset Y"
        valuePostfix=" px"
        value={camera.offsetY.toFixed(0)}
        on:change={(ev) => {
            sendFloat(ev, (n) => sender.setOffset(camera.offsetX, n));
        }}
    >
        <Slider
            value={clamp((camera.offsetY + 2500) / 5000, -5000, 5000)}
            on:change={(ev) => {
                sender.setOffset(camera.offsetX, ev.detail * 5000 - 2500);
            }}
        />
    </Labeled>
</div>

<style>.container {
  width: 100%;
  padding: 0.5rem;
}</style>
