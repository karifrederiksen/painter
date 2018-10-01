import * as RBT from "./redBlackTree"
import { T2 } from "./util"

type Config<k, v> = RBT.Config<k, v, T2<k, v>> & {
    readonly kvpCompare: (a: T2<k, v>, b: T2<k, v>) => number
}

function getValue<k, v>(wrapper: T2<k, v>): v {
    return wrapper[1]
}

function wrapCompare<k, b = any>(compare: RBT.Comp<k, k>): (key: k, other: T2<k, b>) => number {
    return (key, other) => compare(key, other[0])
}

function wrapKvpCompare<a, b = any>(
    compare: RBT.Comp<a, a>
): (node: T2<a, b>, other: T2<a, b>) => number {
    return (node, other) => compare(node[0], other[0])
}

function nodeToKVTuple<k, v>(node: RBT.NonEmptyNode<T2<k, v>>): T2<k, v> {
    return node.value
}

export class OrdMap<k, v> {
    static empty<k, v>(compare: RBT.Comp<k, k>): OrdMap<k, v> {
        return new OrdMap<k, v>(
            {
                compare: wrapCompare(compare),
                kvpCompare: wrapKvpCompare(compare),
                getValue,
            },
            RBT.EMPTY_NODE
        )
    }

    static singleton<k, v>(key: k, value: v, compare: RBT.Comp<k, k>): OrdMap<k, v> {
        return new OrdMap(
            {
                compare: wrapCompare(compare),
                kvpCompare: wrapKvpCompare(compare),
                getValue,
            },
            RBT.NonEmptyNode.singleton([key, value] as T2<k, v>, false)
        )
    }

    static fromIterable<k, v>(iterable: Iterable<T2<k, v>>, compare: RBT.Comp<k, k>): OrdMap<k, v> {
        let t = OrdMap.empty<k, v>(compare)
        for (const val of iterable) {
            t = t.insert(val[0], val[1])
        }
        return t
    }

    get size(): number {
        return this.root.size
    }

    private constructor(
        private readonly config: Config<k, v>,
        private readonly root: RBT.Node<T2<k, v>>
    ) {}

    find(key: k): v | null {
        return this.root.isEmpty() ? null : this.root.get(this.config, key)
    }

    min(): T2<k, v> | null {
        if (this.root.isEmpty()) return null
        return this.root.min(x => x)
    }

    max(): T2<k, v> | null {
        if (this.root.isEmpty()) return null
        return this.root.max(x => x)
    }

    insert(key: k, value: v): OrdMap<k, v> {
        return new OrdMap(this.config, this.root.insert(this.config.kvpCompare, [key, value]))
    }

    remove(key: k): OrdMap<k, v> {
        return new OrdMap(this.config, this.root.remove(this.config.compare, key))
    }

    [Symbol.iterator](): Iterator<T2<k, v>> {
        if (this.root.isEmpty()) return { next: () => ({ done: true } as IteratorResult<T2<k, v>>) }
        return new RBT.BSTIterator(this.root)
    }
}
