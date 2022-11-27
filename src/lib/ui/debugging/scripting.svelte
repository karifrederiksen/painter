<script lang="ts">
    import type { SetOnce } from "$lib/util";
    import { onMount } from "svelte";

    export let gl: SetOnce<WebGLRenderingContext>;

    $: gl_ = gl;

    let code = "";

    const onKeyboard = (ev: KeyboardEvent) => {
        if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
            ev.preventDefault();
            try {
                /* eslint-disable-next-line no-eval */
                console.log(`Evaluating {| ${code} |}`);
                const gl = gl_.value;
                console.log(eval(code));
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
