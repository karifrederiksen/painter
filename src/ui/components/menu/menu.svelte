<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";
    import type { ZipperList } from "../../../collections/zipperList.js";

    type a = $$Generic;

    export let choices: ZipperList<a>;
    export let show: (val: a) => string;

    const dispatch = createEventDispatcher<{ select: a }>();

    let containerRef: HTMLDivElement | null = null;
    let isExpanded = false;

    const onGlobalClick = (ev: MouseEvent) => {
        if (!isExpanded) {
            return;
        }
        let target = ev.target as HTMLElement;
        while (target.parentElement !== null) {
            if (target === containerRef) {
                return;
            }

            target = target.parentElement;
        }
        closeMenu();
    };

    const openMenu = () => {
        isExpanded = true;
    };

    const closeMenu = () => {
        isExpanded = false;
    };

    const closeAndCallback = (val: a) => {
        dispatch("select", val);
        closeMenu();
    };

    onMount(() => {
        document.body.addEventListener("mousedown", onGlobalClick, {
            passive: true,
        });
        return () => {
            document.body.removeEventListener("mousedown", onGlobalClick);
        };
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:blur={closeMenu} bind:this={containerRef} class="container">
    <div class={isExpanded ? "selectedDisplayExpanded" : "selectedDisplay"} on:click={openMenu}>
        {show(choices.focus)}
    </div>
    {#if isExpanded}
        <div
            class="selectableOptions"
            style={`margin-top: ${
                containerRef == null
                    ? "auto"
                    : `calc(-0.5rem - ${containerRef.getBoundingClientRect().height}px)`
            };`}
        >
            <div>
                {#each choices.getLeft() as val}
                    <div class="optionDefault" on:click={() => closeAndCallback(val)}>
                        {show(val)}
                    </div>
                {/each}
                <div class="optionSelected" on:click={closeMenu}>
                    {show(choices.focus)}
                </div>
                {#each choices.getRight() as val}
                    <div class="optionDefault" on:click={() => closeAndCallback(val)}>
                        {show(val)}
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
    @import "../../theme.scss";

    .container {
        background-color: $color-surface;
        color: $color-onSurface;
        min-width: 6rem;
    }

    @mixin selectedDisplayCommon {
        cursor: pointer;
        text-align: center;
        min-width: 100%;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
    }

    .selectedDisplay {
        @include selectedDisplayCommon;
        &:hover {
            background-color: $color-secondary;
            color: $color-onSecondary;
        }
    }

    .selectedDisplayExpanded {
        @include selectedDisplayCommon;
        background-color: $color-secondary;
        color: $color-onSecondary;
    }

    .selectableOptions {
        position: absolute;
        flex-direction: column;
        min-width: 6rem;
        margin-top: 1px;
        background-color: $color-surface;
        color: $color-onSurface;
        box-shadow: $shadows-menu;

        > :first-child {
            border-top-left-radius: 0.25rem;
            border-top-right-radius: 0.25rem;
        }
        > :last-child {
            border-bottom-left-radius: 0.25rem;
            border-bottom-right-radius: 0.25rem;
        }
    }

    @mixin optionCommon {
        cursor: pointer;
        padding: 0.25rem 0.5rem;
    }

    .optionDefault {
        @include optionCommon;
        &:hover {
            background-color: $color-secondaryLight;
        }
    }

    .optionSelected {
        @include optionCommon;
        background-color: $color-secondary;
        color: $color-onSecondary;
    }
</style>
