export interface Store<state, ephemeral, msg> {
    send(msg: msg): void
    getState(): state
}

export namespace Store {
    export interface Args<state, ephemeral, msg, effects> {
        readonly initialState: state
        readonly initialEphemeral: ephemeral
        readonly update: (
            state: state,
            ephemeral: ephemeral,
            msg: msg
        ) => readonly [state, ephemeral, effects]
        readonly effectsHandler: (eff: effects) => void
        readonly forceRender: () => void
    }

    export function create<state, ephemeral, msg, effects>(
        args: Args<state, ephemeral, msg, effects>
    ): Store<state, ephemeral, msg> {
        const { effectsHandler, initialState, initialEphemeral, forceRender, update } = args

        let state = initialState
        let ephemeral = initialEphemeral

        function handleMsg(msg: msg): void {
            const [nextState, nextEphemeral, effect] = update(state, ephemeral, msg)
            if (state !== nextState) {
                forceRender()
                state = nextState
            }
            effectsHandler(effect)
            ephemeral = nextEphemeral
        }

        return {
            send: handleMsg,
            getState: () => state,
        }
    }
}
