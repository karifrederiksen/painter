<div class="surface">
    <slot />
</div>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.surface {
  background-color: var(--color-surface);
  color: var(--color-onSurface);
  box-shadow: var(--shadows-surface);
  pointer-events: all;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  user-select: none;
}</style>
