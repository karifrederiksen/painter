<script lang="ts">
    import * as Color from "color";
    import { onMount } from "svelte";
    import { ColorMode, clamp, CanvasPool } from "../../../util";
    import { GlState, type ThumbPositions } from "./color-wheel-logic";

    export let color: Color.Hsluv;
    export let colorType: ColorMode; // = ColorMode.Hsluv;
    export let onChange: (color: Color.Hsluv) => void;

    const enum PointerState {
        Default,
        DownOnInner,
        DownOnOuter,
    }

    const MARGIN = (1 - 0.55) / 2;
    type WithClientXY = Readonly<{
        clientX: number;
        clientY: number;
    }>;

    let containerRef: HTMLDivElement | undefined;
    let canvasContainerRef: HTMLDivElement | undefined;
    let glState: GlState | null = null;
    let pointerState = PointerState.Default;
    let thumbData: ThumbPositions | null = null;

    function signalOuter(ev: WithClientXY) {
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
                onChange(Color.rgbToHsluv(hsv.with({ h: hue }).toRgb()));
                break;
            }
            case ColorMode.Hsluv: {
                onChange(color.with({ h: hue * 360 }));
                break;
            }
        }
    }

    function signalInner(ev: WithClientXY) {
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
                onChange(Color.rgbToHsluv(Color.hsvToRgb(new Color.Hsv(hue, pctX, pctY))));
                break;
            }
            case ColorMode.Hsluv: {
                const hue = color.h;
                onChange(new Color.Hsluv(hue, pctX * 100, pctY * 100));
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

    {
        function onUp(_ev: WithClientXY) {
            pointerState = PointerState.Default;
        }

        function onMove(ev: WithClientXY) {
            switch (pointerState) {
                case PointerState.Default:
                    break;
                case PointerState.DownOnInner:
                    signalInner(ev);
                    break;
                case PointerState.DownOnOuter:
                    signalOuter(ev);
                    break;
            }
        }

        onMount(() => {
            window.addEventListener("mouseup", onUp);
            window.addEventListener("mouseleave", onUp);
            window.addEventListener("mousemove", onMove, { passive: true });
            return () => {
                window.removeEventListener("mouseup", onUp);
                window.removeEventListener("mouseleave", onUp);
                window.removeEventListener("mousemove", onMove);
            };
        });
    }

    function isInclusive(n: number, min: number, max: number): boolean {
        return n >= min && n <= max;
    }

    function onDown(ev: WithClientXY) {
        if (!containerRef) {
            return;
        }
        const bounds = containerRef.getBoundingClientRect();
        const x = clamp(ev.clientX - bounds.left, 0, bounds.width);
        const y = clamp(ev.clientY - bounds.top, 0, bounds.height);

        const marginX = bounds.width * MARGIN;
        const marginY = bounds.height * MARGIN;

        const isInner =
            isInclusive(x, marginX, bounds.width - marginX) &&
            isInclusive(y, marginY, bounds.height - marginY);

        if (isInner) {
            pointerState = PointerState.DownOnInner;
            signalInner(ev);
        } else {
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
            style={thumbData === null
                ? undefined
                : `left: ${thumbData.circleThumbX}px; top: ${
                      thumbData.circleThumbY
                  }px; background-color: ${color.toStyle()}; border-color: ${
                      color.l > 50 ? "black" : "white"
                  }; transform: rotate(${thumbData.angle}deg)`}
        />
        <div
            class="areaThumb"
            style={thumbData === null
                ? undefined
                : `left: ${thumbData.areaThumbX}px; top: ${
                      thumbData.areaThumbY
                  }px; background-color: ${color.toStyle()}; border-color: ${
                      color.l > 50 ? "black" : "white"
                  }`}
        />
    </div>
</div>

<style lang="scss">
    .container {
        display: flex;
        justify-content: center;
        width: 100%;
    }

    .circleThumb {
        z-index: 100;
        position: absolute;
        width: 1rem;
        height: 0.5rem;
        margin-left: calc(-0.5rem - 0.05rem);
        margin-top: calc(-0.25rem - 0.05rem);
        border-width: 0.1rem;
        border-style: solid;
    }

    .areaThumb {
        z-index: 100;
        position: absolute;
        width: 0.75rem;
        height: 0.75rem;
        margin-left: calc(-0.375rem - 0.05rem);
        margin-top: calc(-0.375rem - 0.05rem);
        border-width: 0.1rem;
        border-style: solid;
        border-radius: 0.375rem;
    }
</style>
