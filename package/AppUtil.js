import { onMount } from "svelte";
export const onBeforeUnload = () => {
    onMount(() => {
        const handle = (e) => {
            e.preventDefault();
            e.returnValue = "";
        };
        window.addEventListener("beforeunload", handle);
        return () => {
            window.removeEventListener("beforeunload", handle);
        };
    });
};
export const getCameraTransform = (cam) => {
    const translate = "translate(" + cam.offsetX + "px, " + cam.offsetY + "px) ";
    const rotate = "rotate(" + cam.rotateTurns + "turn) ";
    const scale = "scale(" + cam.zoomPct + ", " + cam.zoomPct + ")";
    return translate + rotate + scale;
};
