<script lang="ts">
    import { InlineLabeled, Switch } from "$lib/ui/components/index.js";
    import type { Config, Sender } from "$lib/canvas/index.js";

    export let config: Config;
    export let sender: Sender;
</script>

<InlineLabeled label="Display rendering stats">
    <Switch checked={config.displayStats} on:change={sender.toggleDisplayStats} />
</InlineLabeled>

<InlineLabeled label="Highlight blocks">
    <Switch checked={config.highlightRenderBlocks} on:change={sender.toggleHighlightRenderBlocks} />
</InlineLabeled>
