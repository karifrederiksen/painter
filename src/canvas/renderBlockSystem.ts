import { BrushPoint } from "./brushShader"
import { Vec2, clamp } from "../util"

export const PX_PER_BLOCK_X = 32
export const PX_PER_BLOCK_Y = 32

export class Block {
    readonly x0: number
    readonly y0: number
    readonly x1: number
    readonly y1: number

    constructor(x: number, y: number) {
        this.x0 = x * PX_PER_BLOCK_X
        this.y0 = y * PX_PER_BLOCK_Y
        this.x1 = (x + 1) * PX_PER_BLOCK_X
        this.y1 = (y + 1) * PX_PER_BLOCK_Y
    }

    eq(other: Block): boolean {
        return this.x0 === other.x0 && this.y0 === other.y0
    }

    getHashcode(): number {
        let hash = 0
        hash = (hash << 5) - hash + this.x0
        hash = (hash << 5) - hash + this.y0
        return hash
    }

    contains(position: Vec2): boolean {
        return (
            position.x >= this.x0 &&
            position.x <= this.x1 &&
            position.y >= this.y0 &&
            position.y <= this.y1
        )
    }
}

export interface RenderBlockSystemArgs {
    readonly currentTime: number
    readonly brushPoints: readonly BrushPoint[]
}

interface TimedRenderBlock {
    drawTimeMs: number
    readonly block: Block
}

export interface HighlightBlock {
    readonly opacity: number
    readonly block: Block
}

export class RenderBlockSystem {
    private _newBrushPoints: BrushPoint[] = []
    private _strokeBlocks: Block[] = []
    private _renderBlocks: TimedRenderBlock[] = []
    private _finalHighlights: Block[] = []
    private _lastUpdateMs: number = 0

    constructor(readonly debugHighlightTimeMs: number) {}

    getFrameBlocks(): readonly Block[] {
        const renderBlocks = this._renderBlocks
        const finalHighlights = this._finalHighlights
        const length = renderBlocks.length + finalHighlights.length
        const output = new Array<Block>(length)
        let outputIdx = 0

        for (let i = 0; i < renderBlocks.length; i++) {
            output[outputIdx++] = renderBlocks[i].block
        }
        for (let i = 0; i < finalHighlights.length; i++) {
            output[outputIdx++] = finalHighlights[i]
        }

        return output
    }

    getStrokeBlocks(): readonly Block[] {
        return this._strokeBlocks
    }

    getHighlights(): readonly HighlightBlock[] {
        if (this.debugHighlightTimeMs === 0) {
            return []
        }
        const debugHighlightTimeMs = this.debugHighlightTimeMs
        const renderBlocks = this._renderBlocks
        const lastUpdateMs = this._lastUpdateMs
        const output = new Array<HighlightBlock>(renderBlocks.length)

        for (let i = 0; i < renderBlocks.length; i++) {
            const x = renderBlocks[i]
            const dt = lastUpdateMs - x.drawTimeMs
            output[i] = {
                opacity: clamp(1 - dt / debugHighlightTimeMs, 0, 1),
                block: x.block,
            }
        }

        return output
    }

    addBrushPoints(brushPoints: readonly BrushPoint[]): void {
        for (let i = 0; i < brushPoints.length; i++) {
            this._newBrushPoints.push(brushPoints[i])
        }
    }

    update(currentTime: number): void {
        const brushPoints = this._newBrushPoints
        const renderBlocks = this._renderBlocks
        const finalHighlights = this._finalHighlights
        finalHighlights.length = 0

        // remove outdated highlightBlocks
        for (let i = 0; i < renderBlocks.length; i++) {
            const dt = currentTime - renderBlocks[i].drawTimeMs
            if (dt > this.debugHighlightTimeMs) {
                finalHighlights.push(renderBlocks[i].block)
                renderBlocks.splice(i, 1)
                i -= 1
            }
        }

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
                    let existsIdx = -1
                    for (let i = 0; i < renderBlocks.length; i++) {
                        if (renderBlocks[i].block.eq(block)) {
                            renderBlocks[i].drawTimeMs = currentTime
                            existsIdx = i
                            break
                        }
                    }
                    if (existsIdx === -1) {
                        renderBlocks.push({ drawTimeMs: currentTime, block })
                    }
                }
            }
        }
        brushPoints.length = 0

        const strokeBlocks = this._strokeBlocks

        // deduplicated add frameBlocks to strokeBlocks
        for (let i = 0; i < renderBlocks.length; i++) {
            const { block } = renderBlocks[i]
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

        this._lastUpdateMs = currentTime
    }

    /**
     * Mark entire canvas as needing re-rendering.
     */
    fillAll(currentTime: number, resolution: Vec2): void {
        const xBlockMax = (resolution.x / PX_PER_BLOCK_X) | 0
        const yBlockMax = (resolution.y / PX_PER_BLOCK_Y) | 0
        const renderBlocks = this._renderBlocks
        let i = 0
        for (let y = 0; y < yBlockMax; y++) {
            for (let x = 0; x < xBlockMax; x++) {
                const block = new Block(x, y)
                renderBlocks[i++] = { drawTimeMs: currentTime, block }
            }
        }
    }

    /**
     * Call this after the stroke has ended, but before rendering the frame.
     */
    strokeEnded(): void {
        this._strokeBlocks.length = 0
    }
}
