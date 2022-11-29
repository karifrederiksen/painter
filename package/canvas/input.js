import { Observable, fromEvent, map, mergeMap, takeUntil } from "rxjs";
export function listen(canvas) {
    if (window.PointerEvent !== undefined) {
        return listenForPointers(canvas);
    }
    else {
        // Add touch as well?
        return listenForMouse(canvas);
    }
}
const pointerSupportsPressure = {};
function checkPressureSupport(ev) {
    if (ev.pressure === 0.5)
        return;
    if (pointerSupportsPressure[ev.pointerId])
        return;
    pointerSupportsPressure[ev.pointerId] = true;
}
function getPressure(ev) {
    return pointerSupportsPressure[ev.pointerId]
        ? ev.pressure
        : ev.pressure === 0.5
            ? 1.0
            : ev.pressure;
}
const uncoalesce = () => {
    if (PointerEvent.prototype.getCoalescedEvents === undefined) {
        return (ev) => [ev];
    }
    return (ev) => ev.getCoalescedEvents();
};
function localizePointer(time, event, 
// we get the pressure off of the original event because firefox's coalesced events have a bug which causes them to always be 0
originalEvent) {
    return {
        x: event.x,
        y: event.y,
        pressure: getPressure(originalEvent),
        shift: event.shiftKey,
        alt: event.altKey,
        ctrl: event.ctrlKey,
        time,
    };
}
function uncoalesceAndLocalize(time, originalEvent) {
    const events = uncoalesce()(originalEvent);
    const result = new Array(events.length);
    for (let i = 0; i < events.length; i++) {
        // we need to deal with pressure
        result[i] = localizePointer(time, events[i], originalEvent);
    }
    return result;
}
function listenForPointers(canvas) {
    const click = fromEvent(canvas, "pointerdown", { passive: true }).pipe(map((ev) => {
        checkPressureSupport(ev);
        return localizePointer(performance.now(), ev, ev);
    }));
    const move = fromEvent(window, "pointermove", { passive: true }).pipe(map((ev) => {
        checkPressureSupport(ev);
        return uncoalesceAndLocalize(performance.now(), ev);
    }));
    const release = fromEvent(window, "pointerup", { passive: true }).pipe(map((ev) => localizePointer(performance.now(), ev, ev)));
    const drag = click.pipe(mergeMap((_) => move.pipe(takeUntil(release))));
    return {
        click,
        move,
        drag,
        release,
    };
}
function listenForMouse(canvas) {
    const click = fromEvent(canvas, "mousedown", { passive: true }).pipe(map((ev) => localizeMouse(performance.now(), ev, false)));
    const move = fromEvent(window, "mousemove", { passive: true }).pipe(map((ev) => [localizeMouse(performance.now(), ev, false)]));
    const release = fromEvent(window, "mouseup", { passive: true }).pipe(map((ev) => localizeMouse(performance.now(), ev, true)));
    const drag = click.pipe(mergeMap((_) => move.pipe(takeUntil(release))));
    return {
        click,
        move,
        drag,
        release,
    };
}
function localizeMouse(time, ev, isRelease) {
    return {
        x: ev.x,
        y: ev.y,
        pressure: isRelease ? 0.0 : 1.0,
        shift: ev.shiftKey,
        alt: ev.altKey,
        ctrl: ev.ctrlKey,
        time,
    };
}
