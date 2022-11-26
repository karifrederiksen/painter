<script lang="ts">
  export let text: string;

  let contentRef: HTMLElement | null = null;
  let popoverRef: HTMLElement | null = null;
  let timeout: NodeJS.Timeout | null = null;

  function setShouldShow() {
    if (!contentRef || !popoverRef) {
      return;
    }
    const contentBounds = contentRef.getBoundingClientRect();
    popoverRef.style.display = "";
    const popoverBounds = popoverRef.getBoundingClientRect();

    const widthDelta = contentBounds.width - popoverBounds.width;
    const left = contentBounds.left + widthDelta / 2;
    const top = contentBounds.top - popoverBounds.height - 8;

    popoverRef.style.left = left + "px";
    popoverRef.style.top = top + "px";
  }

  function mouseEnterHandler() {
    timeout = setTimeout(setShouldShow, 250);
  }

  function mouseLeaveHandler() {
    if (!popoverRef) {
      return;
    }
    popoverRef.style.display = "none";
    popoverRef.style.left = "";
    popoverRef.style.top = "";

    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  }
</script>

<span on:mouseenter={mouseEnterHandler} on:mouseleave={mouseLeaveHandler}>
  <div class="popover" bind:this={popoverRef}>{text}</div>
  <span bind:this={contentRef}>
    <slot />
  </span>
</span>

<style lang="scss">
  @import "../../theme.scss";

  .popover {
    position: absolute;
    background-color: $color-surface;
    border: 1px solid red;
    padding: 0.5rem 1rem;
  }
</style>
