<script>import { Brush } from "../brush/index.js";
import { Eraser } from "../eraser/index.js";
import { SinkableButton, Icons } from "../components/index.js";
export let sender;
export let tool;
export let transientState;
$: currentToolType = tool.current;
</script>

<div class="toolBarContainer">
    <div class="surfaceLike leftBar">
        <SinkableButton
            isDown={currentToolType === "Brush"}
            on:click={() => sender.setTool("Brush")}
        >
            <Icons.Brush24 />
        </SinkableButton>
        <SinkableButton
            isDown={currentToolType === "Eraser"}
            on:click={() => sender.setTool("Eraser")}
        >
            <Icons.Edit24 />
        </SinkableButton>
        <SinkableButton isDown={currentToolType === "Zoom"} on:click={() => sender.setTool("Zoom")}>
            <Icons.Search24 />
        </SinkableButton>
    </div>
    {#if transientState.isDetailsExpanded}
        {#if currentToolType === "Brush"}
            <Brush brush={tool.brush} sender={sender.brush} />
        {:else if currentToolType === "Eraser"}
            <Eraser brush={tool.eraser} sender={sender.eraser} />
        {/if}
    {/if}
</div>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.toolBarContainer {
  display: flex;
  z-index: 1;
}

.leftBar {
  display: flex;
  flex-direction: column;
  padding-top: 1rem;
  margin-right: 0.5rem;
  gap: 0.125rem;
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  box-shadow: var(--shadows-surface);
  pointer-events: all;
}</style>
