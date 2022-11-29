export function create(args) {
    const { effectsHandler, initialState, initialEphemeral, forceRender, update } = args;
    let state = initialState;
    let ephemeral = initialEphemeral;
    function handleMsg(msg) {
        const startState = state;
        let effect;
        try {
            const [nextState, nextEphemeral, effect_] = update(state, ephemeral, msg);
            if (state !== nextState) {
                state = nextState;
                forceRender(nextState, nextEphemeral);
            }
            effect = effect_;
            ephemeral = nextEphemeral;
        }
        catch (ex) {
            state = startState;
            console.error("[ERROR][Store.update]", state, msg, ex);
            return;
        }
        try {
            effectsHandler(effect);
        }
        catch (ex) {
            state = startState;
            console.error("[ERROR][Store.effectsHandler]", state, msg, effect, ex);
        }
    }
    return {
        send: handleMsg,
        getState: () => state,
        getEphemeral: () => ephemeral,
    };
}
