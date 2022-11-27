<script lang="ts">
    import { onMount } from "svelte";
    import { debuggingGl } from "$lib/ui/state";

    let code = "";

    const onKeyboard = (ev: KeyboardEvent) => {
        if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
            ev.preventDefault();
            try {
                /* eslint-disable-next-line no-eval */
                console.debug(`Evaluating {| ${code} |}`);
                const gl = $debuggingGl;
                console.debug(eval(code));
            } catch (err) {
                console.error("Error: ", err);
            }
            code = "";
        }
    };

    onMount(() => {
        window.addEventListener("keydown", onKeyboard);
        return () => {
            window.removeEventListener("keydown", onKeyboard);
        };
    });
</script>

<div>
    <div>
        Variables
        <ul>
            <li>
                <span class="monospaced">gl</span>: WebGLRenderingContext
            </li>
        </ul>
    </div>
    <textarea class="codeInput" bind:value={code} />
</div>

<style lang="scss">
    @import "../theme.scss";

    .monospaced {
        font-family: $fonts-monospace;
    }

    .codeInput {
        font-family: "Courier New", Courier, monospace;
        background-color: $color-primary;
        color: $color-onPrimary;
        border-radius: 0.25rem;
        padding: 0.25rem;
    }
</style>
