<script lang="ts">
  export let onClick: () => void;
  export let title: string | undefined = undefined;
</script>

<button {title} class="primary" on:click={onClick}>
  <slot />
</button>

<style lang="scss">
  @import "../../theme.scss";

  @mixin common {
    font-size: 1rem;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    position: relative;
    text-decoration: none;
    border: 0;
    border-radius: 0.25rem;
    padding: 0.5rem;
    height: 2.25rem;
    width: 100%;
    min-width: 4rem;
    transition: all 150ms;
    line-height: 1.4em;
    box-shadow: $shadows-button;
  }

  .primary {
    @include common;
    background-color: $color-primary;
    color: $color-onPrimary;

    &:hover {
      background-color: $color-primaryLight;
    }

    &:active {
      background-color: $color-primaryDark;
    }
  }
</style>
