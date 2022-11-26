<div class="surface">
  <slot />
</div>

<style lang="scss">
  @import "../../theme.scss";

  .surface {
    background-color: $color-surface;
    color: $color-onSurface;
    box-shadow: $shadows-surface;
    pointer-events: all;
    display: flex;
    align-items: center;
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    user-select: none;
  }
</style>
