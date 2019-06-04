import { BrushPoint } from "./brushShader"

const PX_PER_BLOCK_X = 32
const PX_PER_BLOCK_Y = 32

export class Block {
    readonly x0: number
    readonly y0: number
    readonly x1: number
    readonly y1: number

    private nominal: void
    constructor(x: number, y: number) {
        this.x0 = x * PX_PER_BLOCK_X
        this.y0 = y * PX_PER_BLOCK_Y
        this.x1 = (x + 1) * PX_PER_BLOCK_X
        this.y1 = (y + 1) * PX_PER_BLOCK_Y
    }

    eq(other: Block): boolean {
        return this.x0 === other.x0 && this.y0 === other.y0
    }
}

// @perf: The BlockTracker could be internally mutable. I can't think of a good reason it _should_ be immutable
export class BlockTracker {
    static EMPTY: BlockTracker = new BlockTracker([], [])

    private nominal: void
    private constructor(
        readonly frameBlocks: ReadonlyArray<Block>,
        readonly strokeBlocks: ReadonlyArray<Block>
    ) {}

    withPoints(brushPoints: ReadonlyArray<BrushPoint>): BlockTracker {
        if (brushPoints.length === 0) {
            return this
        }

        const frameBlocks = this.frameBlocks.slice()
        for (let i = 0; i < brushPoints.length; i++) {
            // 1. find minimum intersection point
            // 2. find maximum intersection point
            // 3. fill in every in between
            // assume the texture is circular with its max radius being width / 2
            const point = brushPoints[i]

            const radius = point.scaledDiameter / 2
            const xMin = point.position.x - radius
            const yMin = point.position.y - radius
            const xMax = point.position.x + radius
            const yMax = point.position.y + radius

            const xBlockMin = (xMin / PX_PER_BLOCK_X) | 0
            const yBlockMin = (yMin / PX_PER_BLOCK_Y) | 0

            const xBlockMax = Math.ceil(xMax / PX_PER_BLOCK_X) | 0
            const yBlockMax = Math.ceil(yMax / PX_PER_BLOCK_Y) | 0

            for (let y = yBlockMin; y <= yBlockMax; y++) {
                for (let x = xBlockMin; x <= xBlockMax; x++) {
                    const block = new Block(x, y)
                    // check if it already exists
                    let exists = false
                    for (let i = 0; i < frameBlocks.length; i++) {
                        if (frameBlocks[i].eq(block)) {
                            exists = true
                            break
                        }
                    }
                    if (!exists) {
                        frameBlocks.push(block)
                    }
                }
            }
        }

        const strokeBlocks = this.strokeBlocks.slice()

        // union, no duplicates
        for (let i = 0; i < frameBlocks.length; i++) {
            const block = frameBlocks[i]
            let exists = false
            for (let j = 0; j < strokeBlocks.length; j++) {
                if (block.eq(strokeBlocks[j])) {
                    exists = true
                    break
                }
            }
            if (!exists) {
                strokeBlocks.push(block)
            }
        }

        return new BlockTracker(frameBlocks, strokeBlocks)
    }

    endStroke(): BlockTracker {
        return new BlockTracker(this.strokeBlocks, [])
    }

    afterFrame(): BlockTracker {
        return new BlockTracker([], this.strokeBlocks)
    }
}
