import { Stack, type PushArray } from "../collections";
export interface Id {
    __nominal: "Id";
}
export interface CollectedLayer {
    readonly id: Id;
    readonly name: string;
    readonly opacity: number;
}
export declare class LeafLayer {
    readonly id: Id;
    readonly name: string;
    readonly opacity: number;
    readonly isHidden: boolean;
    static init(id: Id): LeafLayer;
    private constructor();
    get isLeaf(): true;
    with(args: {
        readonly name?: string;
        readonly opacity?: number;
        readonly isHidden?: boolean;
    }): LeafLayer;
}
export declare class GroupLayer {
    readonly id: Id;
    readonly name: string;
    readonly opacity: number;
    readonly isHidden: boolean;
    readonly children: readonly Layer[];
    static init(id: Id): GroupLayer;
    private constructor();
    get isLeaf(): false;
    with(args: {
        readonly name?: string;
        readonly opacity?: number;
        readonly isHidden?: boolean;
    }): GroupLayer;
    withChildren(children: readonly Layer[]): GroupLayer;
    get(selectedPath: Stack.NonEmpty<number>): Layer;
    getWithContext(selectedPath: Stack.NonEmpty<number>, opacity: number): CollectedLayer;
    findPath(id: Id): Stack.NonEmpty<number> | null;
    insert(selectedPath: Stack.NonEmpty<number>, leaf: LeafLayer): GroupLayer;
    remove(selectedPath: Stack.NonEmpty<number>): readonly [GroupLayer, Stack.Stack<number>];
    update<a extends Layer>(selectedPath: Stack.NonEmpty<number>, updateFn: (layer: a) => a): GroupLayer;
    collectLeaves(array: PushArray<CollectedLayer>, opacity: number): void;
}
export type Layer = LeafLayer | GroupLayer;
export interface SplitLayers {
    readonly above: readonly CollectedLayer[];
    readonly current: CollectedLayer | null;
    readonly below: readonly CollectedLayer[];
}
export type Msg = NewLayerMsg | RemoveMsg | SelectMsg | SetOpacityMsg | SetHiddenMsg;
export declare const enum MsgType {
    NewLayerMsg = 0,
    RemoveMsg = 1,
    SelectMsg = 2,
    SetOpacityMsg = 3,
    SetHiddenMsg = 4
}
declare class NewLayerMsg {
    readonly id: Id;
    readonly type: MsgType.NewLayerMsg;
    constructor(id: Id);
}
declare class RemoveMsg {
    readonly id: Id;
    readonly type: MsgType.RemoveMsg;
    constructor(id: Id);
}
declare class SelectMsg {
    readonly id: Id;
    readonly type: MsgType.SelectMsg;
    constructor(id: Id);
}
declare class SetOpacityMsg {
    readonly id: Id;
    readonly opacity: number;
    readonly type: MsgType.SetOpacityMsg;
    constructor(id: Id, opacity: number);
}
declare class SetHiddenMsg {
    readonly id: Id;
    readonly isHidden: boolean;
    readonly type: MsgType.SetHiddenMsg;
    constructor(id: Id, isHidden: boolean);
}
export declare class Sender {
    private sendMessage;
    constructor(sendMessage: (msg: Msg) => void);
    readonly newLayer: (id: Id) => void;
    readonly removeLayer: (id: Id) => void;
    readonly selectLayer: (id: Id) => void;
    readonly setOpacity: (id: Id, opacity: number) => void;
    readonly setHidden: (id: Id, isHidden: boolean) => void;
}
export declare class State {
    readonly getNextLayerId: () => Id;
    readonly layers: GroupLayer;
    readonly selectedPath: Stack.NonEmpty<number>;
    static init(): State;
    private cachedSplitLayers;
    private constructor();
    current(): Layer;
    update(msg: Msg): State;
    split(): SplitLayers;
    private select;
    private newLayer;
    private removeCurrent;
    private updateCurrent;
}
export {};
