import type { CanvasInfo } from "$lib/canvas";
import type * as Camera from "../lib/tools/camera";
import { Vec2 } from "$lib/util";
import * as Theme from "$lib/ui/theme";
import { afterUpdate, onMount } from "svelte";
import { dev } from "$app/environment";

export const onBeforeUnload = () => {
    if (!dev) {
        onMount(() => {
            const handle = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = "";
            };
            window.addEventListener("beforeunload", handle);
            return () => {
                window.removeEventListener("beforeunload", handle);
            };
        });
    }
};

export const getCanvasOffset = (canvas: HTMLCanvasElement): Vec2 => {
    return new Vec2(canvas.offsetLeft, canvas.offsetTop);
};

export const getCanvasInfo = ({
    canvasOffset,
    canvasResolution,
}: {
    readonly canvasOffset: Vec2;
    readonly canvasResolution: Vec2;
}): CanvasInfo => {
    return {
        resolution: canvasResolution,
        halfResoution: canvasResolution.multiplyScalar(0.5),
        offset: canvasOffset,
    };
};

export const createUpdateThemeEffect = () => {
    let prevTheme: Theme.Theme | null = null;
    return (nextTheme: Theme.Theme) => {
        if (prevTheme === null) {
            Theme.updateAll(nextTheme);
        } else {
            Theme.updateDiff(prevTheme, nextTheme);
        }
        prevTheme = nextTheme;
    };
};

export const getCameraTransform = (cam: Camera.Config): string => {
    const translate = "translate(" + cam.offsetX + "px, " + cam.offsetY + "px) ";
    const rotate = "rotate(" + cam.rotateTurns + "turn) ";
    const scale = "scale(" + cam.zoomPct + ", " + cam.zoomPct + ")";
    return translate + rotate + scale;
};

export const onLayoutChange = (onResize: () => void): void => {
    afterUpdate(() => {
        onResize();
    });
    onMount(() => {
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    });
};
