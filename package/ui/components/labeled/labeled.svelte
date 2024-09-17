<script>import { afterUpdate, createEventDispatcher } from "svelte";
import { Dialog } from "../dialog/index.js";
import { PrimaryButton } from "../buttons/index.js";
import { Row } from "../row/index.js";
import { DefaultButton } from "../buttons/index.js";
import { TextInput } from "../textInput/index.js";
export let label;
export let valuePostfix = undefined;
export let value = "";
const dispatch = createEventDispatcher();
let isEditing = false;
$: inputValue = value;
const handleInput = (text) => {
    inputValue = text;
};
const startEditing = () => {
    isEditing = true;
};
const stopEditing = () => {
    isEditing = false;
};
const handleUpdate = (text) => {
    if (text === null) {
        // unable to parse - show error?
    }
    else {
        dispatch("change", text);
        isEditing = false;
    }
};
const handleUpdateWithText = (text) => {
    handleInput(text);
    handleUpdate(text);
};
</script>

<div class="container">
    <div class="textContainer">
        <p class="label">{label}</p>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p class="label" on:click={startEditing}>{inputValue}{valuePostfix ?? ""}</p>
    </div>
    <Dialog isOpen={isEditing} onClose={stopEditing}>
        <svelte:fragment slot="body">
            <div class="title-text">{label}</div>
            <TextInput
                initialValue={inputValue}
                on:change={(ev) => handleInput(ev.detail)}
                on:enter={(ev) => handleUpdateWithText(ev.detail)}
                autoFocus={true}
            />
        </svelte:fragment>
        <Row spacing={0.5} slot="footer">
            <DefaultButton on:click={stopEditing}>Cancel</DefaultButton>
            <PrimaryButton on:click={() => handleUpdate(inputValue)}>Update</PrimaryButton>
        </Row>
    </Dialog>
    <div class="content">
        <slot />
    </div>
</div>

<style>/*
 * css variables don't get typechecked, and it's very hard to refactor them, so we prefer
 * to use these scss variables that refer to the css variables, since the scss has to be compiled,
 * and the compilation will fail when scss-variables are undefined.
 */
.container {
  color: inherit;
  margin: 0.5rem 0;
  width: 100%;
}

.label {
  color: inherit;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.content {
  width: 100%;
}

.textContainer {
  display: flex;
  justify-content: space-between;
  color: inherit;
  user-select: none;
}

.title-text {
  font-family: var(--fonts-normal);
  font-size: 1.25rem;
  padding-bottom: 0.5rem;
}</style>
