<script>import { onMount } from "svelte";
import { debuggingGl } from "../state";
let code = "";
const onKeyboard = (ev) => {
    if (ev.key === "Enter" && !ev.shiftKey && !ev.altKey) {
        ev.preventDefault();
        try {
            /* eslint-disable-next-line no-eval */
            console.debug(`Evaluating {| ${code} |}`);
            const gl = $debuggingGl;
            console.debug(eval(code));
        }
        catch (err) {
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

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.monospaced {
  font-family: var(--fonts-monospace);
}

.codeInput {
  font-family: "Courier New", Courier, monospace;
  background-color: var(--color-primary);
  color: var(--color-onPrimary);
  border-radius: 0.25rem;
  padding: 0.25rem;
}</style>
