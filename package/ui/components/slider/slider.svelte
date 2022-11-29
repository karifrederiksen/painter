<script>import { clamp } from "../../../util";
import { onMount } from "svelte";
import { createEventDispatcher } from "svelte";
export let value;
export let color = undefined;
const dispatch = createEventDispatcher();
let containerRef = null;
let isDown = false;
const signal = (ev) => {
    if (!containerRef)
        return;
    const bounds = containerRef.getBoundingClientRect();
    const Rem = 16;
    const dotWidth = Rem * 0.75;
    const width = bounds.width - dotWidth;
    const localX = clamp(ev.clientX - bounds.left - dotWidth / 2, 0, width);
    dispatch("change", localX / width);
};
const onDown = (ev) => {
    signal(ev);
    isDown = true;
};
const onUp = () => {
    isDown = false;
};
const onMove = (ev) => {
    if (isDown) {
        signal(ev);
    }
};
onMount(() => {
    document.body.addEventListener("mouseup", onUp, { passive: true });
    document.body.addEventListener("mouseleave", onUp, { passive: true });
    document.body.addEventListener("mousemove", onMove, {
        passive: true,
    });
    return () => {
        document.body.removeEventListener("mouseup", onUp);
        document.body.removeEventListener("mouseleave", onUp);
        document.body.removeEventListener("mousemove", onMove);
    };
});
$: value01 = clamp(value, 0, 1);
</script>

<div class="container" on:mousedown={onDown} bind:this={containerRef}>
    <div>
        <div
            class={value === 0 ? "emptyButton" : "button"}
            style={`left: calc(${value01} * calc(100% - 0.75rem)); background-color: ${color?.toStyle()}`}
        />
        <div
            class="filledLineClass"
            style={`width: ${value01 * 100}%; background-color: ${color?.toStyle()}`}
        />
        <div class="baseline" />
    </div>
</div>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.container {
  cursor: pointer;
  margin: 0.25rem 0;
  padding: 0.25rem 0;
  width: 100%;
  position: relative;
}

.baseline {
  cursor: pointer;
  position: absolute;
  width: 100%;
  right: 0;
  height: 2px;
  top: 50%;
  transform: translate(0, -50%);
  background-color: var(--color-secondaryLight);
  z-index: 0;
}

.filledLineClass {
  cursor: pointer;
  position: absolute;
  height: 2px;
  top: 50%;
  transform: translate(0, -50%);
  background-color: var(--color-primary);
  z-index: 1;
}

.emptyButton {
  cursor: pointer;
  position: absolute;
  border-radius: 50%;
  width: 0.75rem;
  height: 0.75rem;
  transform: translate(0, -50%);
  z-index: 2;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
  background-color: var(--color-secondaryLight);
}

.button {
  cursor: pointer;
  position: absolute;
  border-radius: 50%;
  width: 0.75rem;
  height: 0.75rem;
  transform: translate(0, -50%);
  z-index: 2;
  box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12);
  background-color: var(--color-primary);
}</style>
