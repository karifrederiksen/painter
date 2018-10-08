import { T2, Lazy } from "./util"

export interface Store<state, msg> {
    send(msg: msg): void
    getState(): state
}

export interface StoreArgs<state, msg, effects> {
    readonly initialState: state
    readonly update: (state: state, msg: msg) => T2<state, effects>
    readonly effectsHandler: Lazy<(eff: effects) => void>
    readonly setState: (state: state) => void
}

export function createStore<state, msg, effects>(
    args: StoreArgs<state, msg, effects>
): Store<state, msg> {
    const { effectsHandler, initialState, setState, update } = args

    let state = initialState

    function handleMsg(msg: msg): void {
        const [nextState, effect] = update(state, msg)
        state = nextState
        effectsHandler.value(effect)
        setState(state)
    }

    return {
        send: handleMsg,
        getState: () => state,
    }
}
