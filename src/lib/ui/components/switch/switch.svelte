<script lang="ts">
    export let checked: boolean;
    export let onCheck: (checked: boolean) => void;

    function handler() {
        onCheck(!checked);
    }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<span class="xswitch" on:click={handler}>
    <span
        class="switchButtonContainer"
        style={checked
            ? "transform: translate(0.75rem, -0.125rem)"
            : "transform: translate(0, -0.125rem)"}
    >
        <span class={`switchButton ${checked ? "bgColorPrimary" : "bgColorSecondary"}`} />
    </span>
    <span class="switchBar" />
</span>

<style lang="scss">
    @import "../../theme.scss";

    .xswitch {
        cursor: pointer;
        display: inline-flex;
        margin: 0.5rem 0;
    }

    .switchButtonContainer {
        display: inline-flex;
        position: absolute;
        z-index: 2;
        transition: 150ms transform;
    }

    .switchButton {
        cursor: pointer;
        width: 1rem;
        height: 1rem;
        border-radius: 0.5rem;
        z-index: 2;
        transition: 150ms background-color, 150ms transform;
        box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.12);
    }

    .bgColorPrimary {
        background-color: $color-primary;
    }

    .bgColorSecondary {
        background-color: $color-secondary;
    }

    .switchBar {
        background-color: $color-secondaryLight;
        display: block;
        width: 1.75rem;
        height: 0.75rem;
        border-radius: 0.3775rem;
        z-index: 1;
        transition: 150ms background-color, 150ms opacity;
    }
</style>
