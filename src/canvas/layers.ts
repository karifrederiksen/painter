import { Stack, NonEmptyStack, EmptyStack, T2, PushArray, Msg } from "../data";

export const enum LayersMsgType {
    SelectLayer,
    AddLayer,
    MoveLayer,
    RemoveLayer,
    SetOpacity,
    SetHidden,
    SetFixedAlpha,
    SetGroupOpen,
} 

export type LayersMsg =
    | Msg<LayersMsgType.SelectLayer, LayerId>


export type LayerId = number

export type Layer = LeafLayer | LayerGroup

export class Layers {
    private static nextLayerId = 1

    static init(): Layers {
        const layer = new LeafLayer(this.nextLayerId++, 1, false)
        const group = new LayerGroup([layer], 1, false, false)
        return new Layers(group, new EmptyStack<number>().cons(0))
    }

    private constructor(
        readonly root: LayerGroup,
        readonly pathToCurrent: NonEmptyStack<number>
    ) {}

    current(): ReadonlyArray<T2<LayerId, number>> {
        const arr: PushArray<T2<LayerId, number>> = []
        this.root.selectedLeafs(arr, this.pathToCurrent, 1)
        return arr
    }

    left(): ReadonlyArray<T2<LayerId, number>> {
        const arr: PushArray<T2<LayerId, number>> = []
        this.root.leafsBefore(arr, this.pathToCurrent, 1)
        return arr
    }

    right(): ReadonlyArray<T2<LayerId, number>> {
        const arr: PushArray<T2<LayerId, number>> = []
        this.root.leafsAfter(arr, this.pathToCurrent, 1)
        return arr
    }

    update(msg: LayersMsg): Layers {
        throw "todo"
    }

    // Sequential search
    // select(id: LayerId): Layers {
    //     const path = this.root.find(id)
    //     if (path === null) throw "layer with id '" + id + "' was not found."
    //     return new Layers(this.root, path)
    // }

    // addLayer(id: LayerId): Layers {
    //     throw "todo"
    // }

    // addGroup(): Layers {
    //     throw "todo"
    // }
}

export class LeafLayer {
    constructor(readonly id: LayerId, readonly opacity: number, readonly isHidden: boolean) {}

    get isLeaf(): true {
        return true
    }

    leafs(arr: PushArray<T2<LayerId, number>>, opacity: number): void {
        arr.push([this.id, this.opacity * opacity])
    }

    selectedLeafs(
        arr: PushArray<T2<LayerId, number>>,
        _path: Stack<number>,
        opacity: number,
    ): void {
        arr.push([this.id, this.opacity * opacity])
    }

    leafsBefore(
        arr: PushArray<T2<LayerId, number>>,
        _path: NonEmptyStack<number>,
        opacity: number,
    ): void {
        arr.push([this.id, this.opacity * opacity])
    }

    leafsAfter(
        arr: PushArray<T2<LayerId, number>>,
        _path: NonEmptyStack<number>,
        opacity: number,
    ): void {
        arr.push([this.id, this.opacity * opacity])
    }

    find(id: LayerId): Stack<number> | null {
        return this.id === id ? new EmptyStack<number>() : null
    }
}

export class LayerGroup {
    constructor(
        readonly layers: ReadonlyArray<Layer>,
        readonly opacity: number,
        readonly isHidden: boolean,
        readonly isFixedAlpha: boolean,
    ) {}

    get isLeaf(): false {
        return false
    }

    leafs(arr: PushArray<T2<LayerId, number>>, opacity: number): void {
        opacity *= this.opacity

        const layers = this.layers
        for (let i = 0; i < layers.length; i++) {
            const l = layers[i]
            if (l.isHidden) continue
            l.leafs(arr, opacity)
        }
    }

    selectedLeafs(arr: PushArray<T2<LayerId, number>>, path: Stack<number>, opacity: number): void {
        opacity *= this.opacity

        const layers = this.layers
        if (path.isNonEmpty()) {
            const l = layers[path.head]
            l.selectedLeafs(arr, path.tail, opacity * l.opacity)
        } else
            for (let i = 0; i < layers.length; i++) {
                const l = layers[i]
                if (l.isHidden) continue
                l.leafs(arr, opacity)
            }
    }

    leafsBefore(
        arr: PushArray<T2<LayerId, number>>,
        path: NonEmptyStack<number>,
        opacity: number,
    ): void {
        opacity *= this.opacity

        const stopBeforeIndex = path.head
        const layers = this.layers
        for (let i = 0; i < stopBeforeIndex; i++) {
            const l = layers[i]
            if (l.isHidden) continue
            l.leafsBefore(arr, path.tail as NonEmptyStack<number>, opacity)
        }
    }

    leafsAfter(
        arr: PushArray<T2<LayerId, number>>,
        path: NonEmptyStack<number>,
        opacity: number,
    ): void {
        opacity *= this.opacity

        const startAfterIndex = path.head
        const layers = this.layers
        for (let i = startAfterIndex + 1; i < layers.length; i++) {
            const l = layers[i]
            if (l.isHidden) continue
            l.leafsAfter(arr, path.tail as NonEmptyStack<number>, opacity)
        }
    }

    find(id: LayerId): NonEmptyStack<number> | null {
        const layers = this.layers
        for (let i = 0; i < layers.length; i++) {
            const path = layers[i].find(id)
            if (path !== null) return path.cons(i)
        }
        return null
    }
}