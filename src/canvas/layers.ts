import {
    NonEmptyStack,
    PushArray,
    EmptyStack,
    Msg,
    T2,
    orDefault,
    arrUpdate,
    arrInsert,
    arrRemove,
    Stack,
} from "core"

export type LayerId = number

export interface CollectedLayer {
    readonly id: LayerId
    readonly name: string
    readonly opacity: number
    readonly isHidden: boolean
}

export class LeafLayer {
    static init(id: LayerId): LeafLayer {
        return new LeafLayer(id, "", 1, false)
    }

    private constructor(
        readonly id: LayerId,
        readonly name: string,
        readonly opacity: number,
        readonly isHidden: boolean
    ) {}

    get isLeaf(): true {
        return true
    }

    with(args: {
        readonly name?: string
        readonly opacity?: number
        readonly isHidden?: boolean
    }): LeafLayer {
        const name = orDefault(args.name, this.name)
        const opacity = orDefault(args.opacity, this.opacity)
        const isHidden = orDefault(args.isHidden, this.isHidden)
        return new LeafLayer(this.id, name, opacity, isHidden)
    }
}

export class GroupLayer {
    static init(id: LayerId): GroupLayer {
        return new GroupLayer(id, "", 1, false, [])
    }

    private constructor(
        readonly id: LayerId,
        readonly name: string,
        readonly opacity: number,
        readonly isHidden: boolean,
        readonly children: ReadonlyArray<Layer>
    ) {}

    get isLeaf(): false {
        return false
    }

    with(args: {
        readonly name?: string
        readonly opacity?: number
        readonly isHidden?: boolean
    }): GroupLayer {
        return new GroupLayer(
            this.id,
            orDefault(args.name, this.name),
            orDefault(args.opacity, this.opacity),
            orDefault(args.isHidden, this.isHidden),
            this.children
        )
    }

    withChildren(children: ReadonlyArray<Layer>): GroupLayer {
        return new GroupLayer(this.id, this.name, this.opacity, this.isHidden, children)
    }

    get(selectedPath: NonEmptyStack<number>): Layer {
        const index = selectedPath.head
        const selected = this.children[index]

        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf) throw "Invariant violation"

            return selected.get(selectedPath.tail)
        }

        return selected
    }

    getWithContext(
        selectedPath: NonEmptyStack<number>,
        context: CollectLeavesContext
    ): CollectedLayer {
        const index = selectedPath.head
        const selected = this.children[index]

        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf) throw "Invariant violation"

            return selected.getWithContext(selectedPath.tail, {
                isHidden: context.isHidden || this.isHidden,
                opacity: context.opacity * this.opacity,
            })
        }

        return {
            id: selected.id,
            isHidden: context.isHidden || selected.isHidden,
            name: selected.name,
            opacity: context.opacity * selected.opacity,
        }
    }

    findPath(id: LayerId): NonEmptyStack<number> | null {
        const children = this.children

        for (let i = 0; i < this.children.length; i++) {
            const child = children[i]
            if (child.isLeaf) {
                if (child.id === id) return new EmptyStack<number>().cons(i)
            } else {
                const path = child.findPath(id)
                if (path !== null) return path.cons(i)
            }
        }

        return null
    }

    insert(selectedPath: NonEmptyStack<number>, leaf: LeafLayer): GroupLayer {
        const index = selectedPath.head
        const selected = this.children[index]

        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf) throw "Invariant violation"

            const newSelected = selected.insert(selectedPath.tail, leaf)
            const newChildren = arrUpdate(this.children, index, newSelected)
            return this.withChildren(newChildren)
        } else {
            return this.withChildren(arrInsert(this.children, index, leaf))
        }
    }

    remove(selectedPath: NonEmptyStack<number>): T2<GroupLayer, Stack<number>> {
        const index = selectedPath.head
        const selected = this.children[index]

        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf) throw "Invariant violation"

            const [newSelected, newSelectedPath] = selected.remove(selectedPath.tail)
            const newChildren = arrUpdate(this.children, index, newSelected)
            return [this.withChildren(newChildren), newSelectedPath.cons(index)]
        } else {
            const newChildren = this.withChildren(arrRemove(this.children, index))
            if (newChildren.children.length === 0) return [newChildren, new EmptyStack()]

            const newIndex = this.children.length === index + 1 ? index - 1 : index
            const newSelectedPath = index === newIndex ? selectedPath : NonEmptyStack.of(newIndex)
            return [newChildren, newSelectedPath]
        }
    }

    update<a extends Layer>(
        selectedPath: NonEmptyStack<number>,
        updateFn: (layer: a) => a
    ): GroupLayer {
        const index = selectedPath.head
        const selected = this.children[index]

        if (selectedPath.tail.isNonEmpty()) {
            if (selected.isLeaf) throw "Invariant violation"

            const newSelected = selected.update(selectedPath.tail, updateFn)
            const newChildren = arrUpdate(this.children, index, newSelected)
            return this.withChildren(newChildren)
        } else {
            const newSelected = updateFn(selected as a)
            const newChildren = arrUpdate(this.children, index, newSelected)
            return this.withChildren(newChildren)
        }
    }

    collectLeaves(array: PushArray<CollectedLayer>, context: CollectLeavesContext): void {
        const children = this.children
        for (let i = 0; i < children.length; i++) {
            const layer = children[i]
            if (layer.isLeaf) {
                array.push({
                    id: layer.id,
                    isHidden: context.isHidden || layer.isHidden,
                    name: layer.name,
                    opacity: context.opacity * layer.opacity,
                })
            } else {
                layer.collectLeaves(array, {
                    opacity: context.opacity * layer.opacity,
                    isHidden: context.isHidden || layer.isHidden,
                })
            }
        }
    }
}

interface CollectLeavesContext {
    readonly opacity: number
    readonly isHidden: boolean
}

export type Layer = LeafLayer | GroupLayer

export interface SplitLayers {
    readonly above: ReadonlyArray<CollectedLayer>
    readonly current: CollectedLayer | null
    readonly below: ReadonlyArray<CollectedLayer>
}

export enum LayersMsgType {
    NewLayer,
    Remove,
    Select,
    SetOpacity,
    SetHidden,
}

export type LayersMsg =
    | Msg<LayersMsgType.NewLayer, LayerId>
    | Msg<LayersMsgType.Remove, LayerId>
    | Msg<LayersMsgType.Select, LayerId>
    | Msg<LayersMsgType.SetOpacity, T2<LayerId, number>>
    | Msg<LayersMsgType.SetHidden, T2<LayerId, boolean>>

export interface LayerMessageSender {
    newLayer(id: LayerId): void
    removeLayer(id: LayerId): void
    selectLayer(id: LayerId): void
    setOpacity(id: LayerId, opacity: number): void
    setHidden(id: LayerId, isHidden: boolean): void
}

export function createLayerSender(sendMessage: (msg: LayersMsg) => void): LayerMessageSender {
    return {
        newLayer: id => sendMessage({ type: LayersMsgType.NewLayer, payload: id }),
        removeLayer: id => sendMessage({ type: LayersMsgType.Remove, payload: id }),
        selectLayer: id => sendMessage({ type: LayersMsgType.Select, payload: id }),
        setOpacity: (id, opacity) =>
            sendMessage({ type: LayersMsgType.SetOpacity, payload: [id, opacity] }),
        setHidden: (id, isHidden) =>
            sendMessage({ type: LayersMsgType.SetHidden, payload: [id, isHidden] }),
    }
}

export class LayerState {
    static init(): LayerState {
        const leaf = LeafLayer.init(getNextLayerId())
        const group = GroupLayer.init(getNextLayerId()).withChildren([leaf])
        return new LayerState(group, new EmptyStack<number>().cons(0))
    }

    private splitLayers: SplitLayers | null = null

    private constructor(
        readonly layers: GroupLayer,
        readonly selectedPath: NonEmptyStack<number>
    ) {}

    current(): Layer {
        return this.layers.get(this.selectedPath)
    }

    update(msg: LayersMsg): LayerState {
        switch (msg.type) {
            case LayersMsgType.NewLayer:
                return this.current().id === msg.payload ? this.newLayer() : this

            case LayersMsgType.Remove:
                return this.current().id === msg.payload ? this.removeCurrent() : this

            case LayersMsgType.Select:
                return this.current().id === msg.payload ? this : this.select(msg.payload)

            case LayersMsgType.SetOpacity: {
                const [msgLayerId, opacity] = msg.payload
                const current = this.current()

                return current.id === msgLayerId
                    ? this.updateCurrent(x => x.with({ opacity }))
                    : this
            }

            case LayersMsgType.SetHidden: {
                const [msgLayerId, isHidden] = msg.payload
                const current = this.current()
                console.log("isHidden", current.isHidden, isHidden)

                return current.id === msgLayerId
                    ? this.updateCurrent(x => x.with({ isHidden }))
                    : this
            }
        }
    }

    split(): SplitLayers {
        if (this.splitLayers === null) {
            const children = this.layers.children
            const selectedIdx = this.selectedPath.head
            const above: PushArray<CollectedLayer> = []
            const below: PushArray<CollectedLayer> = []
            const context: CollectLeavesContext = { opacity: 1, isHidden: false }

            for (let i = 0; i < selectedIdx; i++) {
                const child = children[i]
                if (child.isLeaf) above.push(child)
                else child.collectLeaves(above, context)
            }

            for (let i = this.selectedPath.head + 1; i < children.length; i++) {
                const child = children[i]
                if (child.isLeaf) below.push(child)
                else child.collectLeaves(below, context)
            }

            const current = this.layers.get(this.selectedPath)
            if (current.isLeaf)
                return {
                    above,
                    current: this.layers.getWithContext(this.selectedPath, context),
                    below,
                }

            current.collectLeaves(below, context)
            this.splitLayers = { above, current: null, below }
        }
        return this.splitLayers
    }

    private select(id: LayerId): LayerState {
        const path = this.layers.findPath(id)
        if (path === null) return this

        return new LayerState(this.layers, path)
    }

    private newLayer(): LayerState {
        const layers = this.layers.insert(this.selectedPath, LeafLayer.init(getNextLayerId()))

        return new LayerState(layers, this.selectedPath)
    }

    // newGroup(): LayerState {
    //     throw "todo"
    // }

    private removeCurrent(): LayerState {
        const current = this.current()
        const [newLayers, newSelectedPath] = this.layers.remove(this.selectedPath)

        if (newSelectedPath.isNonEmpty()) return new LayerState(newLayers, newSelectedPath)

        const oldIndex = this.selectedPath.head
        const newIndex = newLayers.children.length <= oldIndex ? oldIndex : oldIndex - 1
        return new LayerState(newLayers, NonEmptyStack.of(newIndex))
    }

    private updateCurrent<a extends Layer>(updateFn: (layer: a) => a): LayerState {
        return new LayerState(this.layers.update(this.selectedPath, updateFn), this.selectedPath)
    }
}

const getNextLayerId: () => number = (() => {
    let layerId = 1
    return () => layerId++
})()
