<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";

    export let initialValue: string;
    export let autoFocus: boolean = false;

    const dispatch = createEventDispatcher<{ change: string; enter: string }>();

    let inputRef: HTMLInputElement | null = null;
    let text: string = initialValue;

    function handleChange(ev: Event) {
        dispatch("change", (ev.target as HTMLInputElement).value);
    }

    function handleKeyboard(ev: KeyboardEvent) {
        if (ev.key !== "Enter") {
            return;
        }
        dispatch("enter", text);
    }

    onMount(() => {
        if (autoFocus) {
            inputRef?.focus();
        }
    });
</script>

<input
    bind:this={inputRef}
    bind:value={text}
    on:paste={handleChange}
    on:change={handleChange}
    on:keydown={handleKeyboard}
    class="textInput"
    type="text"
/>

<style lang="scss">
    @import "../../theme.scss";

    .textInput {
        background-color: $color-surface;
        color: $color-onSurface;
        padding: 0.25rem 0.5rem;
        border-color: $color-onSurface;
        border-width: 1px;
        border-style: solid;
        border-radius: 0.25rem;
        font-family: $fonts-monospace;
        width: 100%;

        &:focus {
            border-color: $color-primary;
        }
    }
</style>
