<script lang="ts">
    import type { Hsv } from "color";
    import { clamp } from "../../../util";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";

    export let percentage: number;
    export let color: Hsv | undefined = undefined;

    const dispatch = createEventDispatcher<{ change: number }>();

    let containerRef: HTMLDivElement | null = null;
    let isDown = false;

    const signal = (ev: MouseEvent): void => {
        if (!containerRef) return;
        const bounds = containerRef.getBoundingClientRect();
        const Rem = 16;
        const dotWidth = Rem * 0.75;
        const width = bounds.width - dotWidth;

        const localX = clamp(ev.clientX - bounds.left - dotWidth / 2, 0, width);

        dispatch("change", localX / width);
    };

    const onDown = (ev: MouseEvent) => {
        signal(ev);
        isDown = true;
    };

    const onUp = () => {
        isDown = false;
    };

    const onMove = (ev: MouseEvent) => {
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

    $: percentage01 = Math.max(0, Math.min(1, percentage));
</script>

<div class="container" on:mousedown={onDown} bind:this={containerRef}>
    <div>
        <div
            class={percentage === 0 ? "emptyButton" : "button"}
            style={`left: calc(${percentage01} * calc(100% - 0.75rem)); background-color: ${color?.toStyle()}`}
        />
        <div
            class="filledLineClass"
            style={`width: ${percentage01 * 100}%; background-color: ${color?.toStyle()}`}
        />
        <div class="baseline" />
    </div>
</div>

<style lang="scss">
    @import "../../theme.scss";

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
        background-color: $color-secondaryLight;
        z-index: 0;
    }

    .filledLineClass {
        cursor: pointer;
        position: absolute;
        height: 2px;
        top: 50%;
        transform: translate(0, -50%);
        background-color: $color-primary;
        z-index: 1;
    }

    @mixin buttonBase {
        cursor: pointer;
        position: absolute;
        border-radius: 50%;
        width: 0.75rem;
        height: 0.75rem;
        transform: translate(0, -50%);
        z-index: 2;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
    }

    .emptyButton {
        @include buttonBase;
        background-color: $color-secondaryLight;
    }

    .button {
        @include buttonBase;
        background-color: $color-primary;
    }
</style>
