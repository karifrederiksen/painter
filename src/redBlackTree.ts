/*
 * This is mostly a port of the scala RBT
 * https://lampsvn.epfl.ch/trac/scala/browser/scala/tags/R_2_9_0_final/src//library/scala/collection/immutable/RedBlack.scala#L1
 */

export type Comp<a, b> = (key: a, otherKey: b) => number
export type GetValue<a, b> = (value: a) => b

export interface Config<k, v, n> {
    readonly compare: Comp<k, n>
    readonly getValue: GetValue<n, v>
}

export type Node<a> = EmptyNode<a> | NonEmptyNode<a>

export class EmptyNode<a> {
    get size(): 0 {
        return 0
    }

    get isRed(): false {
        return false
    }

    isEmpty(): this is EmptyNode<a> {
        return true
    }

    get<k, v>(_config: Config<k, v, a>, _value: k): v | null {
        return null
    }

    min<v>(getValue: GetValue<a, v>): null {
        return null
    }

    max<v>(getValue: GetValue<a, v>): null {
        return null
    }

    insert<k>(_compare: Comp<a, a>, value: a): NonEmptyNode<a> {
        return new NonEmptyNode(value, this, this, true)
    }

    remove<k>(_compare: Comp<k, a>, _value: k): Node<a> {
        return this
    }
}

export const EMPTY_NODE: EmptyNode<any> = new EmptyNode()

export class NonEmptyNode<a> {
    static singleton<a>(value: a, isRed: boolean): NonEmptyNode<a> {
        return new NonEmptyNode(value, EMPTY_NODE, EMPTY_NODE, isRed)
    }

    static red<a>(value: a, left: Node<a>, right: Node<a>): NonEmptyNode<a> {
        return new NonEmptyNode(value, left, right, true)
    }

    static black<a>(value: a, left: Node<a>, right: Node<a>): NonEmptyNode<a> {
        return new NonEmptyNode(value, left, right, false)
    }

    readonly size: number

    constructor(
        readonly value: a,
        readonly left: Node<a>,
        readonly right: Node<a>,
        readonly isRed: boolean
    ) {
        this.size = left.size + right.size + 1
    }

    isEmpty(): this is EmptyNode<a> {
        return false
    }

    get<k, v>(config: Config<k, v, a>, value: k): v | null {
        let node: Node<a> = this
        while (!node.isEmpty()) {
            const c = config.compare(value, node.value)
            if (c < 0) node = node.left
            else if (c > 0) node = node.right
            else return config.getValue(node.value)
        }
        return null
    }

    min<v>(getValue: GetValue<a, v>): v {
        let node: NonEmptyNode<a> = this
        while (!node.left.isEmpty()) {
            node = node.left
        }
        return getValue(node.value)
    }

    max<v>(getValue: GetValue<a, v>): v {
        let node: NonEmptyNode<a> = this
        while (!node.right.isEmpty()) {
            node = node.right
        }
        return getValue(node.value)
    }

    insert<k>(compare: Comp<a, a>, value: a): NonEmptyNode<a> {
        const c = compare(value, this.value)
        if (c < 0)
            return balanceLeft(this.value, this.left.insert(compare, value), this.right, this.isRed)

        if (c > 0)
            return balanceRight(
                this.value,
                this.left,
                this.right.insert(compare, value),
                this.isRed
            )
        return new NonEmptyNode(value, this.left, this.right, this.isRed)
    }

    remove<k>(compare: Comp<k, a>, key: k): Node<a> {
        const c = compare(key, this.value)

        if (c < 0) {
            if (this.left.isRed) {
                return NonEmptyNode.red(this.value, this.left.remove(compare, key), this.right)
            }
            return balLeft(this.value, this.left.remove(compare, key), this.right as NonEmptyNode<
                a
            >)
        }
        if (c > 0) {
            if (this.right.isRed) {
                return NonEmptyNode.red(this.value, this.left, this.right.remove(compare, key))
            }

            return balRight(
                this.value,
                this.left as NonEmptyNode<a>,
                this.right.remove(compare, key)
            )
        }

        return append(this.left, this.right)
    }

    blacken(): NonEmptyNode<a> {
        if (!this.isRed) return this
        return new NonEmptyNode(this.value, this.left, this.right, false)
    }
}

function balanceLeft<a>(z: a, l: NonEmptyNode<a>, d: Node<a>, isRed: boolean): NonEmptyNode<a> {
    if (l.isRed) {
        if (l.left.isRed) {
            const newLeft = NonEmptyNode.black(l.left.value, l.left.left, l.left.right)
            const newRight = NonEmptyNode.black(z, l.right, d)
            return NonEmptyNode.red(l.value, newLeft, newRight)
        }
        if (l.right.isRed) {
            const newLeft = NonEmptyNode.black(l.value, l.left, l.right.left)
            const newRight = NonEmptyNode.black(z, l.right.right, d)
            return NonEmptyNode.red(l.value, newLeft, newRight)
        }
    }

    return new NonEmptyNode(z, l, d, isRed)
}

function balanceRight<v>(x: v, a: Node<v>, r: NonEmptyNode<v>, isRed: boolean): NonEmptyNode<v> {
    if (r.isRed) {
        if (r.left.isRed) {
            const newLeft = NonEmptyNode.black(x, a, r.left.left)
            const newRight = NonEmptyNode.black(r.value, r.left.right, r.right)
            return NonEmptyNode.red(r.left.value, newLeft, newRight)
        }
        if (r.right.isRed) {
            const newLeft = NonEmptyNode.black(x, a, r.left)
            const newRight = NonEmptyNode.black(r.right.value, r.right.left, r.right.right)
            return NonEmptyNode.red(r.value, newLeft, newRight)
        }
    }

    return new NonEmptyNode(x, a, r, isRed)
}

// def balance(x: A, xv: B, tl: Tree[B], tr: Tree[B]) = (tl, tr) match {
function balance<v>(x: v, tl: Node<v>, tr: Node<v>): Node<v> {
    // case (RedTree(y, yv, a, b), RedTree(z, zv, c, d)) =>
    //   RedTree(x, xv, BlackTree(y, yv, a, b), BlackTree(z, zv, c, d))
    if (tl.isRed && tr.isRed) {
        return NonEmptyNode.red(x, tl.blacken(), tr.blacken())
    }

    // case (RedTree(y, yv, RedTree(z, zv, a, b), c), d) =>
    //   RedTree(y, yv, BlackTree(z, zv, a, b), BlackTree(x, xv, c, d))
    if (tl.isRed && tl.left.isRed) {
        return NonEmptyNode.red(
            tl.value,
            tl.left.blacken(),
            NonEmptyNode.black(x, tl.left.right, tr)
        )
    }

    // case (RedTree(y, yv, a, RedTree(z, zv, b, c)), d) =>
    //   RedTree(z, zv, BlackTree(y, yv, a, b), BlackTree(x, xv, c, d))
    if (tl.isRed && tl.right.isRed) {
        return NonEmptyNode.red(
            tl.right.value,
            NonEmptyNode.black(tl.value, tl.left, tl.right.left),
            NonEmptyNode.black(x, tl.right.left, tl.right.right)
        )
    }

    // case (a, RedTree(y, yv, b, RedTree(z, zv, c, d))) =>
    //   RedTree(y, yv, BlackTree(x, xv, a, b), BlackTree(z, zv, c, d))
    if (tr.isRed && tr.right.isRed) {
        return NonEmptyNode.red(tr.value, NonEmptyNode.black(x, tl, tr.left), tr.right.blacken())
    }

    // case (a, RedTree(y, yv, RedTree(z, zv, b, c), d)) =>
    //   RedTree(z, zv, BlackTree(x, xv, a, b), BlackTree(y, yv, c, d))
    if (tr.isRed && tr.left.isRed) {
        return NonEmptyNode.red(
            tr.left.value,
            NonEmptyNode.black(x, tl, tr.left.left),
            NonEmptyNode.black(tr.value, tr.left.right, tr.right)
        )
    }

    // case (a, b) =>
    //   BlackTree(x, xv, a, b)
    return NonEmptyNode.black(x, tl, tr)
}

// def subl(t: Tree[B]) = t match {
function subl<v>(node: NonEmptyNode<v>): NonEmptyNode<v> {
    //   case BlackTree(x, xv, a, b) => RedTree(x, xv, a, b)
    if (!node.isRed) return NonEmptyNode.red(node.value, node.left, node.right)
    //   case _ => sys.error("Defect: invariance violation; expected black, got "+t)
    throw "Invariance violation. Expected black, got red"
}

// def balLeft(x: A, xv: B, tl: Tree[B], tr: Tree[B]) = (tl, tr) match {
function balLeft<v>(x: v, tl: Node<v>, tr: NonEmptyNode<v>): Node<v> {
    // case (RedTree(y, yv, a, b), c) =>
    //   RedTree(x, xv, BlackTree(y, yv, a, b), c)
    if (tl.isRed) {
        return NonEmptyNode.red(x, tl.blacken(), tr)
    }

    // case (bl, BlackTree(y, yv, a, b)) =>
    //   balance(x, xv, bl, RedTree(y, yv, a, b))
    if (!tr.isRed) {
        return balance(x, tl, NonEmptyNode.red(tr.value, tr.left, tr.right))
    }

    // case (bl, RedTree(y, yv, BlackTree(z, zv, a, b), c)) =>
    //   RedTree(z, zv, BlackTree(x, xv, bl, a), balance(y, yv, b, subl(c)))
    if (tr.isRed && !tr.left.isRed) {
        const rightLeft = tr.left as NonEmptyNode<v>
        const rightRight = tr.right as NonEmptyNode<v>
        return NonEmptyNode.red(
            rightLeft.value,
            NonEmptyNode.black(x, tl, rightLeft.left),
            balance(tr.value, rightLeft.right as NonEmptyNode<v>, subl(rightRight))
        )
    }

    // case _ => sys.error("Defect: invariance violation at "+right)
    throw "Invariance violation."
}

// def balRight(x: A, xv: B, tl: Tree[B], tr: Tree[B]) = (tl, tr) match {
function balRight<v>(x: v, tl: NonEmptyNode<v>, tr: Node<v>): Node<v> {
    // case (a, RedTree(y, yv, b, c)) =>
    //   RedTree(x, xv, a, BlackTree(y, yv, b, c))
    if (tr.isRed) {
        return NonEmptyNode.red(x, tl, tr.blacken())
    }

    // case (BlackTree(y, yv, a, b), bl) =>
    //   balance(x, xv, RedTree(y, yv, a, b), bl)
    if (!tl.isRed) {
        return balance(x, tl, tr)
    }

    // case (RedTree(y, yv, a, BlackTree(z, zv, b, c)), bl) =>
    //   RedTree(z, zv, balance(y, yv, subl(a), b), BlackTree(x, xv, c, bl))
    if (tl.isRed && !tl.right.isRed) {
        const leftLeft = tl.left as NonEmptyNode<v>
        const leftRight = tl.right as NonEmptyNode<v>

        return NonEmptyNode.red(
            leftRight.value,
            balance(tl.value, subl(leftLeft), leftRight.left as NonEmptyNode<v>),
            NonEmptyNode.black(x, leftRight.right, tr)
        )
    }

    // case _ => sys.error("Defect: invariance violation at "+left)
    throw "Invariance violation."
}

// def append(tl: Tree[B], tr: Tree[B]): Tree[B] = (tl, tr) match {
function append<k, v>(tl: Node<v>, tr: Node<v>): Node<v> {
    // case (Empty, t) => t
    if (tl.isEmpty()) return tr
    // case (t, Empty) => t
    if (tr.isEmpty()) return tl

    // case (RedTree(x, xv, a, b), RedTree(y, yv, c, d)) =>
    if (tl.isRed && tr.isRed) {
        // append(b, c) match {
        const res = append(tl.right, tr.left)

        // case RedTree(z, zv, bb, cc) => RedTree(z, zv, RedTree(x, xv, a, bb), RedTree(y, yv, cc, d))
        if (res.isRed) {
            return NonEmptyNode.red(
                res.value,
                NonEmptyNode.red(tl.value, tl.left, res.left),
                NonEmptyNode.red(tr.value, res.right, tr.right)
            )
        }

        // case bc => RedTree(x, xv, a, RedTree(y, yv, bc, d))
        return NonEmptyNode.red(tl.value, tl.left, NonEmptyNode.red(tr.value, res, tr.right))
    }

    // case (BlackTree(x, xv, a, b), BlackTree(y, yv, c, d)) =>
    if (!tl.isRed && !tr.isRed) {
        const res = append(tl.right, tr.left)
        // append(b, c) match {

        // case RedTree(z, zv, bb, cc) => RedTree(z, zv, BlackTree(x, xv, a, bb), BlackTree(y, yv, cc, d))
        if (res.isRed) {
            return NonEmptyNode.red(
                res.value,
                NonEmptyNode.black(tl.value, tl.left, res.left),
                NonEmptyNode.black(tr.value, res.right, tr.right)
            )
        }
        // case bc => balLeft(x, xv, a, BlackTree(y, yv, bc, d))
        return balLeft(
            tl.value,
            tl.left as NonEmptyNode<v>,
            NonEmptyNode.black(tr.value, res, tr.right)
        )
    }

    // case (a, RedTree(x, xv, b, c)) => RedTree(x, xv, append(a, b), c)
    if (tr.isRed) {
        return NonEmptyNode.red(tr.value, append(tl, tr.left), tr.right)
    }

    // case (RedTree(x, xv, a, b), c) => RedTree(x, xv, a, append(b, c))
    return NonEmptyNode.red(tl.value, tl.left, append(tl.right, tr))
}

export class BSTIterator<a> implements Iterator<a> {
    private readonly stack: Array<NonEmptyNode<a>>

    constructor(private readonly node: NonEmptyNode<a>) {
        const stack: Array<NonEmptyNode<a>> = [node]
        let n = node
        while (!n.left.isEmpty()) {
            n = n.left
            stack.push(n)
        }
        this.stack = stack
    }

    next(): IteratorResult<a> {
        const { stack } = this

        if (stack.length === 0) return { done: true } as IteratorResult<a>

        const resultNode = stack.pop()!

        let node = resultNode.right
        while (!node.isEmpty()) {
            stack.push(node)
            node = node.left
        }
        return { done: false, value: resultNode.value }
    }
}
