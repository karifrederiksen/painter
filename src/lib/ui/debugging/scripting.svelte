<script lang="ts">
    import type { SetOnce } from "$lib/util";
    import { onMount } from "svelte";

    export let gl: SetOnce<WebGLRenderingContext>;

    let textareaRef: HTMLTextAreaElement | null = null;
    let code = "";

    const onInput = (ev: Event) => {
        code = (ev.target as any).value;
    };

    const onKeyboard = (ev: KeyboardEvent) => {
        if (textareaRef === null || textareaRef !== ev.target) {
            return;
        }
        if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
            ev.preventDefault();
            try {
                /* eslint-disable-next-line no-eval */
                console.log(eval("var gl = props.gl.value;\n" + code));
            } catch {}
            code = "";
        }
    };

    onMount(() => {
        document.body.addEventListener("keydown", onKeyboard);
        return () => {
            document.body.removeEventListener("keydown", onKeyboard);
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
    <textarea class="codeInput" on:change={onInput} bind:this={textareaRef} content={code} />
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
