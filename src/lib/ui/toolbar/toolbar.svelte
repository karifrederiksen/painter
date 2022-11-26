<script lang="ts">
  import type * as Tools from "../../tools";
  import { Brush } from "../brush";
  import { Eraser } from "../eraser";
  import { SinkableButton, Icons } from "../components";

  interface TransientState {
    readonly isDetailsExpanded: boolean;
  }

  export let sender: Tools.Sender;
  export let tool: Tools.Config;
  export let transientState: TransientState;

  $: currentToolType = tool.current;
</script>

<div class="toolBarContainer">
  <div class="surfaceLike leftBar">
    <SinkableButton isDown={currentToolType === "Brush"} onClick={() => sender.setTool("Brush")}>
      <Icons.Brush24 />
    </SinkableButton>
    <SinkableButton isDown={currentToolType === "Eraser"} onClick={() => sender.setTool("Eraser")}>
      <Icons.Edit24 />
    </SinkableButton>
    <SinkableButton isDown={currentToolType === "Zoom"} onClick={() => sender.setTool("Zoom")}>
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

<style lang="scss">
  @import "../theme.scss";

  .toolBarContainer {
    display: flex;
    z-index: 1;
  }
  .surfaceLike {
    background-color: $color-surface;
    color: $color-onSurface;
    box-shadow: $shadows-surface;
    pointer-events: all;
  }

  .leftBar {
    display: flex;
    flex-direction: column;
    padding-top: 1rem;
    margin-right: 0.5rem;
    gap: 0.125rem;
  }
</style>
