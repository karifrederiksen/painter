import * as RBT from "./redBlackTree"

type Config<v> = RBT.Config<v, v, v>

export class OrdSet<v> {
    static empty<v>(compare: RBT.Comp<v, v>): OrdSet<v> {
        return new OrdSet<v>({ compare, getValue: x => x }, RBT.EMPTY_NODE)
    }

    static singleton<v>(value: v, compare: RBT.Comp<v, v>): OrdSet<v> {
        return new OrdSet({ compare, getValue: x => x }, RBT.NonEmptyNode.singleton(value, false))
    }

    static fromIterable<v>(iterable: Iterable<v>, compare: RBT.Comp<v, v>): OrdSet<v> {
        let t = OrdSet.empty<v>(compare)
        for (const val of iterable) {
            t = t.insert(val)
        }
        return t
    }

    get size(): number {
        return this.root.size
    }

    private constructor(private readonly config: Config<v>, private readonly root: RBT.Node<v>) {}

    has(value: v): boolean {
        return this.root.isEmpty() ? false : this.root.get(this.config, value) !== null
    }

    min(): v | null {
        if (this.root.isEmpty()) return null
        return this.root.min(this.config.getValue)
    }

    max(): v | null {
        if (this.root.isEmpty()) return null
        return this.root.max(this.config.getValue)
    }

    insert(value: v): OrdSet<v> {
        return new OrdSet(this.config, this.root.insert(this.config.compare, value))
    }

    remove(value: v): OrdSet<v> {
        return new OrdSet(this.config, this.root.remove(this.config.compare, value))
    }

    [Symbol.iterator](): Iterator<v> {
        if (this.root.isEmpty()) return { next: () => ({ done: true } as IteratorResult<v>) }
        return new RBT.BSTIterator(this.root)
    }
}
