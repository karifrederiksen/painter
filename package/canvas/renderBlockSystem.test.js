import { test } from "vitest";
import { RenderBlockSystem } from "./renderBlockSystem";
import { RgbLinear } from "color";
import { Vec2 } from "../util";
function createBrushPoint(scaledDiameter, position) {
    return {
        color: RgbLinear.White,
        alpha: 1,
        rotation: 0,
        scaledDiameter,
        position: position,
    };
}
test("no blocks will be output without input", (t) => {
    const system = new RenderBlockSystem(5);
    t.expect(system.getFrameBlocks()).deep.equals([]);
    t.expect(system.getHighlights()).deep.equals([]);
    t.expect(system.getStrokeBlocks()).deep.equals([]);
    for (const time of [0, 1, 2, 3, 4, 5, 6]) {
        system.update(time);
        t.expect(system.getFrameBlocks()).deep.equals([]);
        t.expect(system.getHighlights()).deep.equals([]);
        t.expect(system.getStrokeBlocks()).deep.equals([]);
    }
});
test("highlight blocks will be produced after an update() when there is input", (t) => {
    {
        const system = new RenderBlockSystem(5);
        system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))]);
        t.expect(system.getFrameBlocks()).deep.equals([]);
        system.update(1);
        t.expect(system.getFrameBlocks()).not.deep.equals([]);
    }
    {
        const system = new RenderBlockSystem(5);
        const brushPoints = [
            createBrushPoint(2, new Vec2(2, 2)),
            createBrushPoint(2, new Vec2(123, 2)),
            createBrushPoint(2, new Vec2(2, 123)),
            createBrushPoint(2, new Vec2(123, 123)),
        ];
        system.addBrushPoints(brushPoints);
        system.update(1);
        const frameBlocks = system.getFrameBlocks();
        for (const point of brushPoints) {
            t.expect(frameBlocks.some((block) => block.contains(point.position))).toBeTruthy();
        }
    }
});
test("no highlight blocks will be produced when highlightTime is 0", (t) => {
    const system = new RenderBlockSystem(0);
    system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))]);
    system.update(1);
    t.expect(system.getStrokeBlocks()).not.deep.equals([]);
    t.expect(system.getHighlights()).deep.equals([]);
});
test("getStrokeBlocks() returns empty after strokeEnded()", (t) => {
    const system = new RenderBlockSystem(0);
    system.addBrushPoints([createBrushPoint(2, new Vec2(2, 2))]);
    system.update(1);
    t.expect(system.getStrokeBlocks()).not.deep.equals([]);
    system.strokeEnded();
    t.expect(system.getStrokeBlocks()).deep.equals([]);
});
