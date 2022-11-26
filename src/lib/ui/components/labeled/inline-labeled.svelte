<script lang="ts">
  export let label: string;
</script>

<div class="container">
  <div class="label">{label}</div>
  <slot />
</div>

<style>
  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: inherit;
    margin: 0.25rem 0;
    width: 100%;
  }

  .label {
    color: inherit;
    font-size: 0.875rem;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
  }
</style>
