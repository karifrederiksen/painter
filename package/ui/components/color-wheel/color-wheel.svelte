<script>import { createEventDispatcher } from "svelte";
import * as Color from "color";
import { onMount } from "svelte";
import { ColorMode, clamp, CanvasPool } from "../../../util/index.js";
import { GlState } from "./color-wheel-logic.js";
export let color;
export let colorType; // = ColorMode.Hsluv;
const dispatch = createEventDispatcher();
const colorChange = (color) => {
    dispatch("colorChange", color);
};
var PointerState;
(function (PointerState) {
    PointerState[PointerState["Default"] = 0] = "Default";
    PointerState[PointerState["DownOnInner"] = 1] = "DownOnInner";
    PointerState[PointerState["DownOnOuter"] = 2] = "DownOnOuter";
})(PointerState || (PointerState = {}));
const MARGIN = (1 - 0.55) / 2;
let containerRef;
let canvasContainerRef;
let glState;
let pointerState = PointerState.Default;
$: thumbData = glState?.getThumbPositions(colorType, color);
function signalOuter(ev) {
    if (!containerRef) {
        return;
    }
    // get xy delta from the center of the ring
    const bounds = containerRef.getBoundingClientRect();
    const x = ev.clientX - bounds.left - bounds.width * 0.5;
    const y = ev.clientY - bounds.top - bounds.height * 0.5;
    // calculate radians of the delta
    const rad = Math.atan2(y, x);
    // get hue from radians (keep in mind the ring is turned 50%)
    const hue = rad / (Math.PI * 2) + 0.5;
    switch (colorType) {
        case ColorMode.Hsv: {
            const hsv = Color.rgbToHsv(color.toRgb());
            colorChange(Color.rgbToHsluv(hsv.with({ h: hue }).toRgb()));
            break;
        }
        case ColorMode.Hsluv: {
            colorChange(color.with({ h: hue * 360 }));
            break;
        }
    }
}
function signalInner(ev) {
    if (!containerRef) {
        return;
    }
    const bounds = containerRef.getBoundingClientRect();
    const marginX = bounds.width * MARGIN;
    const marginY = bounds.height * MARGIN;
    const width = bounds.width - marginX * 2;
    const height = bounds.height - marginY * 2;
    const x = clamp(ev.clientX - bounds.left - marginX, 0, width);
    const y = clamp(ev.clientY - bounds.top - marginY, 0, height);
    const pctX = x / width;
    const pctY = 1 - y / height;
    switch (colorType) {
        case ColorMode.Hsv: {
            const hue = Color.rgbToHsv(color.toRgb()).h;
            colorChange(Color.rgbToHsluv(Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY))));
            break;
        }
        case ColorMode.Hsluv: {
            const hue = color.h;
            colorChange(new Color.Hsluv(hue, pctX * 100, pctY * 100));
            break;
        }
    }
}
onMount(() => {
    const canvasContainer = canvasContainerRef;
    if (canvasContainer == null) {
        throw { "canvas container ref not found": canvasContainerRef };
    }
    const canvas = CanvasPool.getCanvas({ width: 160, height: 160 });
    canvasContainer.appendChild(canvas);
    glState = new GlState(canvas);
    glState.render(colorType, color);
    thumbData = glState.getThumbPositions(colorType, color);
    return () => {
        if (!glState) {
            return;
        }
        canvasContainerRef?.removeChild(glState.canvas);
        glState.dispose();
        CanvasPool.recycle(glState.canvas);
    };
});
$: if (glState) {
    glState.render(colorType, color);
}
onMount(() => {
    const onUp = (ev) => {
        ev.preventDefault();
        pointerState = PointerState.Default;
    };
    const onMove = (ev) => {
        switch (pointerState) {
            case PointerState.Default:
                break;
            case PointerState.DownOnInner:
                ev.preventDefault();
                signalInner(ev);
                break;
            case PointerState.DownOnOuter:
                ev.preventDefault();
                signalOuter(ev);
                break;
        }
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mouseleave", onUp);
    window.addEventListener("mousemove", onMove);
    return () => {
        pointerState = PointerState.Default;
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("mouseleave", onUp);
        window.removeEventListener("mousemove", onMove);
    };
});
function isInclusive(n, min, max) {
    return n >= min && n <= max;
}
function onDown(ev) {
    if (!containerRef) {
        return;
    }
    const bounds = containerRef.getBoundingClientRect();
    const x = clamp(ev.clientX - bounds.left, 0, bounds.width);
    const y = clamp(ev.clientY - bounds.top, 0, bounds.height);
    const marginX = bounds.width * MARGIN;
    const marginY = bounds.height * MARGIN;
    const isInner = isInclusive(x, marginX, bounds.width - marginX) &&
        isInclusive(y, marginY, bounds.height - marginY);
    if (isInner) {
        pointerState = PointerState.DownOnInner;
        signalInner(ev);
    }
    else {
        pointerState = PointerState.DownOnOuter;
        signalOuter(ev);
    }
}
</script>

<div class="container" bind:this={containerRef} on:mousedown={onDown}>
    <div>
        <div bind:this={canvasContainerRef} />
        <div
            class="circleThumb"
            style={thumbData == null
                ? undefined
                : `left: ${thumbData.circleThumbX}px; top: ${
                      thumbData.circleThumbY
                  }px; background-color: ${color.toStyle()}; border-color: ${
                      color.l > 50 ? "black" : "white"
                  }; transform: rotate(${thumbData.angle}deg)`}
        />
        <div
            class="areaThumb"
            style={thumbData == null
                ? undefined
                : `left: ${thumbData.areaThumbX}px; top: ${
                      thumbData.areaThumbY
                  }px; background-color: ${color.toStyle()}; border-color: ${
                      color.l > 50 ? "black" : "white"
                  }`}
        />
    </div>
</div>

<style>.container {
  display: flex;
  justify-content: center;
  width: 100%;
  height: 160px;
}

.circleThumb {
  z-index: 100;
  position: absolute;
  width: 1rem;
  height: 0.5rem;
  margin-left: -0.55rem;
  margin-top: -0.3rem;
  border-width: 0.1rem;
  border-style: solid;
}

.areaThumb {
  z-index: 100;
  position: absolute;
  width: 0.75rem;
  height: 0.75rem;
  margin-left: -0.425rem;
  margin-top: -0.425rem;
  border-width: 0.1rem;
  border-style: solid;
  border-radius: 0.375rem;
}</style>
