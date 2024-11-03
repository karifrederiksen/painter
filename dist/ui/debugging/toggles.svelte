<script>import { InlineLabeled, Switch } from "../components/index.js";
export let config;
export let sender;
</script>

<InlineLabeled label="Display rendering stats">
    <Switch checked={config.displayStats} on:change={sender.toggleDisplayStats} />
</InlineLabeled>

<InlineLabeled label="Highlight blocks">
    <Switch checked={config.highlightRenderBlocks} on:change={sender.toggleHighlightRenderBlocks} />
</InlineLabeled>
