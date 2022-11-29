import type * as Camera from "./tools/camera.js";
import { onMount } from "svelte";

export const onBeforeUnload = () => {
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
};

export const getCameraTransform = (cam: Camera.Config): string => {
    const translate = "translate(" + cam.offsetX + "px, " + cam.offsetY + "px) ";
    const rotate = "rotate(" + cam.rotateTurns + "turn) ";
    const scale = "scale(" + cam.zoomPct + ", " + cam.zoomPct + ")";
    return translate + rotate + scale;
};
