<script lang="ts">
  export let spacing: number;
</script>

<div class="row" style="gap: {spacing}rem">
  <slot />
</div>

<style>
  .row {
    display: flex;
    flex-direction: row;
    width: inherit;
    height: inherit;
  }
</style>
