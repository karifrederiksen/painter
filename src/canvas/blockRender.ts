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

export class BlockTracker {
    private _frameBlocks: Block[]
    private _strokeBlocks: Block[]

    constructor() {
        this._frameBlocks = []
        this._strokeBlocks = []
    }

    /**
     * Returns a readonly reference to the internally mutable and unstable frameblock array.
     *
     * Do not store the reference.
     */
    getFrameBlocks(): readonly Block[] {
        return this._frameBlocks
    }

    /**
     * Returns a readonly reference to the internally mutable and unstable strokeblock array.
     *
     * Do not store the reference.
     */
    getStrokeBlocks(): readonly Block[] {
        return this._strokeBlocks
    }

    /**
     * Track the blocks that the given brushPoints might touch.
     */
    addPoints(brushPoints: readonly BrushPoint[]): void {
        if (brushPoints.length === 0) {
            return
        }

        const frameBlocks = this._frameBlocks
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

            const xBlockMax = (xMax / PX_PER_BLOCK_X) | 0
            const yBlockMax = (yMax / PX_PER_BLOCK_Y) | 0

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

        const strokeBlocks = this._strokeBlocks

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
    }

    /**
     * Call this after the stroke has ended, but before rendering the frame.
     */
    strokeEnded(): void {
        this._frameBlocks.splice(0, this._frameBlocks.length, ...this._strokeBlocks)
        this._strokeBlocks.length = 0
    }

    /**
     * Call this after the frame has been rendered.
     */
    afterFrame(): void {
        this._frameBlocks.length = 0
    }
}
