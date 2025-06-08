export interface Unsubscribe {
    (): void;
}

export interface Observable<a> {
    subscribe(f: (val: a) => void): Unsubscribe;
}

export interface PointerData {
    readonly x: number;
    readonly y: number;
    readonly pressure: number;
    readonly shift: boolean;
    readonly alt: boolean;
    readonly ctrl: boolean;
    readonly time: number;
}

export interface Observables {
    readonly click: Observable<PointerData>;
    readonly move: Observable<readonly PointerData[]>;
    readonly drag: Observable<readonly PointerData[]>;
    readonly release: Observable<PointerData>;
}

export function listen(canvas: HTMLCanvasElement): Observables {
    if (window.PointerEvent !== undefined) {
        return listenForPointers(canvas);
    } else {
        // Add touch as well?
        return listenForMouse(canvas);
    }
}

const pointerSupportsPressure: { [pointerId: number]: boolean } = {};

function checkPressureSupport(ev: PointerEvent): void {
    if (ev.pressure === 0 || ev.pressure === 0.5) return;
    if (pointerSupportsPressure[ev.pointerId]) return;

    pointerSupportsPressure[ev.pointerId] = true;
}

function getPressure(ev: PointerEvent): number {
    return pointerSupportsPressure[ev.pointerId]
        ? ev.pressure
        : ev.pressure === 0.5
        ? 1.0
        : ev.pressure;
}

const uncoalesce = () => {
    if (PointerEvent.prototype.getCoalescedEvents === undefined) {
        return (ev: PointerEvent) => [ev];
    }
    return (ev: PointerEvent) => ev.getCoalescedEvents();
};

function localizePointer(
    time: number,
    event: PointerEvent,
    // we get the pressure off of the original event because firefox's coalesced events have a bug which causes them to always be 0
    originalEvent: PointerEvent,
): PointerData {
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

function uncoalesceAndLocalize(time: number, originalEvent: PointerEvent): PointerData[] {
    const events = uncoalesce()(originalEvent);
    const result = new Array<PointerData>(events.length);
    for (let i = 0; i < events.length; i++) {
        // we need to deal with pressure
        result[i] = localizePointer(time, events[i], originalEvent);
    }
    return result;
}

function fromEvent<key extends keyof HTMLElementEventMap>(
    canvas: HTMLElement,
    key: key,
): Observable<HTMLElementEventMap[key]> {
    return {
        subscribe(f) {
            canvas.addEventListener(key, f, { passive: true });
            return () => {
                canvas.removeEventListener(key, f);
            };
        },
    };
}

function map<a, b>(obs: Observable<a>, trans: (val: a) => b): Observable<b> {
    return {
        subscribe(f) {
            return obs.subscribe((v) => f(trans(v)));
        },
    };
}

function mergeMap<a, b>(obs: Observable<a>, create: (val: a) => Observable<b>): Observable<b> {
    return {
        subscribe(f) {
            let tempUnsub: Unsubscribe | undefined;
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

function takeUntil<a, b>(obsA: Observable<a>, obsB: Observable<b>): Observable<a> {
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

function listenForPointers(canvas: HTMLCanvasElement): Observables {
    const click = map(fromEvent(canvas, "pointerdown"), (ev) => {
        checkPressureSupport(ev);
        return localizePointer(performance.now(), ev, ev);
    });
    const move = map(fromEvent(document.body, "pointermove"), (ev) => {
        checkPressureSupport(ev);
        return uncoalesceAndLocalize(performance.now(), ev);
    });
    const release = map(fromEvent(document.body, "pointerup"), (ev) =>
        localizePointer(performance.now(), ev, ev),
    );
    const drag = mergeMap(click, (_) => takeUntil(move, release));
    return {
        click,
        move,
        drag,
        release,
    };
}

function listenForMouse(canvas: HTMLCanvasElement): Observables {
    const click = map(fromEvent(canvas, "mousedown"), (ev) =>
        localizeMouse(performance.now(), ev, false),
    );
    const move = map(fromEvent(document.body, "mousemove"), (ev) => [
        localizeMouse(performance.now(), ev, false),
    ]);
    const release = map(fromEvent(document.body, "mouseup"), (ev) =>
        localizeMouse(performance.now(), ev, true),
    );
    const drag = mergeMap(click, (_) => takeUntil(move, release));
    return {
        click,
        move,
        drag,
        release,
    };
}

function localizeMouse(time: number, ev: MouseEvent, isRelease: boolean): PointerData {
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
