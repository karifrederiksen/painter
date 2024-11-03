export interface Store<state, ephemeral, msg> {
    send(msg: msg): void;
    getState(): state;
    getEphemeral(): ephemeral;
}
export interface Args<state, ephemeral, msg, effects> {
    readonly initialState: state;
    readonly initialEphemeral: ephemeral;
    readonly update: (state: state, ephemeral: ephemeral, msg: msg) => readonly [state, ephemeral, effects];
    readonly effectsHandler: (eff: effects) => void;
    readonly forceRender: (state: state, eph: ephemeral) => void;
}
export declare function create<state, ephemeral, msg, effects>(args: Args<state, ephemeral, msg, effects>): Store<state, ephemeral, msg>;
