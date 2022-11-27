export interface Store<state, ephemeral, msg> {
    send(msg: msg): void;
    getState(): state;
    getEphemeral(): ephemeral;
}

export interface Args<state, ephemeral, msg, effects> {
    readonly initialState: state;
    readonly initialEphemeral: ephemeral;
    readonly update: (
        state: state,
        ephemeral: ephemeral,
        msg: msg,
    ) => readonly [state, ephemeral, effects];
    readonly effectsHandler: (eff: effects) => void;
    readonly forceRender: () => void;
}

export function create<state, ephemeral, msg, effects>(
    args: Args<state, ephemeral, msg, effects>,
): Store<state, ephemeral, msg> {
    const { effectsHandler, initialState, initialEphemeral, forceRender, update } = args;

    let state = initialState;
    let ephemeral = initialEphemeral;

    function handleMsg(msg: msg): void {
        const startState = state;
        let effect: effects;
        try {
            const [nextState, nextEphemeral, effect_] = update(state, ephemeral, msg);
            if (state !== nextState) {
                forceRender();
                state = nextState;
            }
            effect = effect_;
            ephemeral = nextEphemeral;
        } catch (ex) {
            state = startState;
            console.error("[ERROR][Store.update]", state, msg, ex);
            return;
        }
        try {
            effectsHandler(effect);
        } catch (ex) {
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
