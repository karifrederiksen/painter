<script lang="ts">
    export let onClick: () => void;
    export let onDownClick: () => void = () => {};
    export let title: string | undefined = undefined;
    export let isDown: boolean;
</script>

<button
    {title}
    class={isDown ? "sinkableSunk" : "sinkableUnsunk"}
    on:click={isDown ? onClick : onDownClick}
>
    <slot />
</button>

<style lang="scss">
    @import "../../theme.scss";

    .sinkableUnsunk {
        background-color: rgba(0, 0, 0, 0);
        padding: 12px 16px;
        border: 0;
        border-bottom: 2px solid transparent;
        transition: background-color 0.15s;

        &:hover {
            background-color: rgba(0, 0, 0, 0.15);
        }
    }

    .sinkableSunk {
        background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.2));
        padding: 12px 16px;
        border: 0;
        border-bottom: 2px solid rgba(255, 255, 255, 0.5);
    }
</style>
