<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { Dialog } from "../dialog";
    import { PrimaryButton } from "..";
    import { Row } from "../row";
    import { DefaultButton } from "../buttons";
    import { TextInput } from "../textInput";

    export type a = $$Generic;

    export let label: string;
    export let valuePostfix: string | undefined = undefined;
    export let value: a;
    export let toString: (value: a) => string;
    export let fromString: (text: string) => a | null;

    const dispatch = createEventDispatcher<{ change: a }>();

    let isEditing = false;
    $: inputValue = toString(value);

    const handleInput = (text: string) => {
        inputValue = text;
    };

    const startEditing = () => {
        isEditing = true;
    };

    const stopEditing = () => {
        isEditing = false;
    };

    const handleUpdate = (text: string) => {
        const value = fromString(text);
        console.debug("update value", value);
        if (value === null) {
            // unable to parse - show error?
        } else {
            dispatch("change", value);
            isEditing = false;
        }
    };

    const handleUpdateWithText = (text: string) => {
        handleInput(text);
        handleUpdate(text);
    };
</script>

<div class="container">
    <div class="textContainer">
        <p class="label">{label}</p>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <p class="label" on:click={startEditing}>{toString(value)}{valuePostfix ?? ""}</p>
    </div>
    <Dialog isOpen={isEditing} onClose={stopEditing}>
        <svelte:fragment slot="body">
            <div class="title-text">{label}</div>
            <TextInput
                initialValue={inputValue}
                onChange={handleInput}
                onEnter={handleUpdateWithText}
                autoFocus={true}
            />
        </svelte:fragment>
        <Row spacing={0.5} slot="footer">
            <DefaultButton onClick={stopEditing}>Cancel</DefaultButton>
            <PrimaryButton onClick={() => handleUpdate(inputValue)}>Update</PrimaryButton>
        </Row>
    </Dialog>
    <div class="content">
        <slot />
    </div>
</div>

<style lang="scss">
    @import "../../theme.scss";

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
        font-family: $fonts-normal;
        font-size: 1.25rem;
        padding-bottom: 0.5rem;
    }
</style>
