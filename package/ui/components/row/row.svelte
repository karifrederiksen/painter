<script>export let spacing;
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
