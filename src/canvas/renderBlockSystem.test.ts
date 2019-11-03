import test from "ava"
import { BrushPoint } from "./brushShader"
import { RenderBlockSystem } from "./renderBlockSystem"
import { RgbLinear } from "color"
import { Vec2 } from "../util"

function createBrushPoint(scaledDiameter: number, position: Vec2): BrushPoint {
    return {
        color: RgbLinear.White,
        alpha: 1,
        rotation: 0,
        scaledDiameter,
        position: position,
    }
}

test("no blocks will be output without input", t => {
    const system = new RenderBlockSystem(5)

    t.deepEqual(system.getFrameBlocks(), [])
    t.deepEqual(system.getHighlights(), [])
    t.deepEqual(system.getStrokeBlocks(), [])

    for (const time of [0, 1, 2, 3, 4, 5, 6]) {
        system.update(time)
        t.deepEqual(system.getFrameBlocks(), [])
        t.deepEqual(system.getHighlights(), [])
        t.deepEqual(system.getStrokeBlocks(), [])
    }
})

test("highlight blocks will be produced after an update() when there is input", t => {
    {
        const system = new RenderBlockSystem(5)

        system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))])
        t.deepEqual(system.getFrameBlocks(), [])

        system.update(1)
        t.notDeepEqual(system.getFrameBlocks(), [])
    }
    {
        const system = new RenderBlockSystem(5)

        const brushPoints = [
            createBrushPoint(2, new Vec2(2, 2)),
            createBrushPoint(2, new Vec2(123, 2)),
            createBrushPoint(2, new Vec2(2, 123)),
            createBrushPoint(2, new Vec2(123, 123)),
        ]

        system.addBrushPoints(brushPoints)
        system.update(1)

        const frameBlocks = system.getFrameBlocks()
        for (const point of brushPoints) {
            t.assert(frameBlocks.some(block => block.contains(point.position)))
        }
    }
})

test("no highlight blocks will be produced when highlightTime is 0", t => {
    const system = new RenderBlockSystem(0)
    system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))])
    system.update(1)
    t.notDeepEqual(system.getStrokeBlocks(), [])
    t.deepEqual(system.getHighlights(), [])
})

test("getStrokeBlocks() returns empty after strokeEnded()", t => {
    const system = new RenderBlockSystem(0)

    system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))])
    system.update(1)
    t.notDeepEqual(system.getStrokeBlocks(), [])

    system.strokeEnded()
    t.deepEqual(system.getStrokeBlocks(), [])
})
