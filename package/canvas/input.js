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
    if (ev.pressure === 0 || ev.pressure === 0.5)
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
function fromEvent(canvas, key) {
    return {
        subscribe(f) {
            canvas.addEventListener(key, f, { passive: true });
            return () => {
                canvas.removeEventListener(key, f);
            };
        },
    };
}
function map(obs, trans) {
    return {
        subscribe(f) {
            return obs.subscribe((v) => f(trans(v)));
        },
    };
}
function mergeMap(obs, create) {
    return {
        subscribe(f) {
            let tempUnsub;
            const unsub = obs.subscribe((v) => {
                tempUnsub?.();
                tempUnsub = create(v).subscribe(f);
            });
            return () => {
                tempUnsub?.();
                unsub();
            };
        },
    };
}
function takeUntil(obsA, obsB) {
    return {
        subscribe(f) {
            const unsub = () => {
                unsubA();
                unsubB();
            };
            const unsubA = obsA.subscribe(f);
            const unsubB = obsB.subscribe(unsub);
            return unsub;
        },
    };
}
function listenForPointers(canvas) {
    const click = map(fromEvent(canvas, "pointerdown"), (ev) => {
        checkPressureSupport(ev);
        return localizePointer(performance.now(), ev, ev);
    });
    const move = map(fromEvent(document.body, "pointermove"), (ev) => {
        checkPressureSupport(ev);
        return uncoalesceAndLocalize(performance.now(), ev);
    });
    const release = map(fromEvent(document.body, "pointerup"), (ev) => localizePointer(performance.now(), ev, ev));
    const drag = mergeMap(click, (_) => takeUntil(move, release));
    return {
        click,
        move,
        drag,
        release,
    };
}
function listenForMouse(canvas) {
    const click = map(fromEvent(canvas, "mousedown"), (ev) => localizeMouse(performance.now(), ev, false));
    const move = map(fromEvent(document.body, "mousemove"), (ev) => [
        localizeMouse(performance.now(), ev, false),
    ]);
    const release = map(fromEvent(document.body, "mouseup"), (ev) => localizeMouse(performance.now(), ev, true));
    const drag = mergeMap(click, (_) => takeUntil(move, release));
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
