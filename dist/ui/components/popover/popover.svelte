<script>export let text;
let contentRef = null;
let popoverRef = null;
let timeout = null;
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

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.popover {
  position: absolute;
  background-color: var(--color-surface);
  border: 1px solid red;
  padding: 0.5rem 1rem;
}</style>
