import { lerp, distance, Vec2 } from "../util/index.js";
export function init(prevPoint) {
    return { prevPoint };
}
export function interpolate(state, brush, end) {
    if (state === null) {
        const brushPoint = {
            alpha: end.alpha,
            color: end.color,
            position: end.position,
            rotation: end.rotation,
            scaledDiameter: brush.diameterPx * end.pressure,
        };
        return [{ prevPoint: end }, [brushPoint]];
    }
    const start = state.prevPoint;
    const spacingPx = brush.spacingPct * brush.diameterPx;
    // const pcts =
    //     brush.pressureAffectsSize && start.pressure !== end.pressure
    //         ? interpolateWithPressureScaling(spacingPx, start, end)
    //         : interpolateNormal(spacingPx, start, end)
    const pcts = interpolateWithPressureScaling(spacingPx, start, end);
    if (pcts.length === 0) {
        return [state, []];
    }
    const pressureIsEq = start.pressure === end.pressure;
    const alphaIsEq = start.alpha === end.alpha;
    const colorIsEq = start.color.is(end.color);
    const rotationIsEq = start.rotation === end.rotation;
    const pctsLen = pcts.length;
    const brushPoints = new Array(pctsLen);
    for (let i = 0; i < pctsLen; i++) {
        const pct = pcts[i];
        const alpha = alphaIsEq ? start.alpha : lerp(pct, start.alpha, end.alpha);
        const color = colorIsEq ? start.color : start.color.mix(pct, end.color);
        const position = Vec2.lerp(pct, start.position, end.position);
        const scaledDiameter = brush.diameterPx *
            (pressureIsEq ? start.pressure : lerp(pct, start.pressure, end.pressure));
        const rotation = rotationIsEq ? start.rotation : lerp(pct, start.rotation, end.rotation);
        brushPoints[i] = {
            alpha,
            color,
            position,
            scaledDiameter,
            rotation,
        };
    }
    const lastBrushPoint = brushPoints[pcts.length - 1];
    const prevPoint = {
        alpha: lastBrushPoint.alpha,
        color: lastBrushPoint.color,
        position: lastBrushPoint.position,
        pressure: lerp(pcts[pcts.length - 1], start.pressure, end.pressure),
        rotation: lastBrushPoint.rotation,
    };
    return [{ prevPoint }, brushPoints];
}
// TODO: fix this optimization
function interpolateNormal(spacingPx, start, end) {
    const totalDist = Vec2.distance(start.position, end.position);
    const count = Math.floor(totalDist / spacingPx);
    const arr = new Array(count);
    for (let i = 0; i < count; i++) {
        arr[i] = (i * spacingPx) / totalDist;
    }
    return arr;
}
// Potential optimization?: the if condition can probably be avoided
function interpolateWithPressureScaling(spacingPx, start, end) {
    const arr = [];
    const endX = end.position.x;
    const endY = end.position.y;
    const endPressure = end.pressure;
    const endSpacing = Math.max(spacingPx * endPressure, 0.05);
    let x = start.position.x;
    let y = start.position.y;
    let pressure = start.pressure;
    const totalDist = distance(x, y, endX, endY);
    let dist = totalDist;
    let p = 0.5;
    let prevX = x;
    let prevY = y;
    let prevPressure = pressure;
    while (dist > endSpacing && p > 0) {
        p = (spacingPx * pressure) / dist;
        x += p * (endX - x);
        y += p * (endY - y);
        pressure += p * (endPressure - pressure);
        dist = distance(x, y, endX, endY);
        if (x !== prevX || y !== prevY || pressure !== prevPressure) {
            arr.push(1 - dist / totalDist);
            prevX = x;
            prevY = y;
            prevPressure = pressure;
        }
    }
    return arr;
}
