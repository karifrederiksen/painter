<script>import { createEventDispatcher } from "svelte";
import { onMount } from "svelte";
export let choices;
export let show;
const dispatch = createEventDispatcher();
let containerRef = null;
let isExpanded = false;
const onGlobalClick = (ev) => {
    if (!isExpanded) {
        return;
    }
    let target = ev.target;
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
const closeAndCallback = (val) => {
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

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.container {
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  min-width: 6rem;
}

.selectedDisplay {
  cursor: pointer;
  text-align: center;
  min-width: 100%;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}
.selectedDisplay:hover {
  background-color: var(--color-secondary);
  color: var(--color-onSecondary);
}

.selectedDisplayExpanded {
  cursor: pointer;
  text-align: center;
  min-width: 100%;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--color-secondary);
  color: var(--color-onSecondary);
}

.selectableOptions {
  position: absolute;
  flex-direction: column;
  min-width: 6rem;
  margin-top: 1px;
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  box-shadow: var(--shadows-menu);
}
.selectableOptions > :first-child {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}
.selectableOptions > :last-child {
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.optionDefault {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
}
.optionDefault:hover {
  background-color: var(--color-secondaryLight);
}

.optionSelected {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  background-color: var(--color-secondary);
  color: var(--color-onSecondary);
}</style>
