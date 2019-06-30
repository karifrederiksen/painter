declare global {
    interface PointerEvent {
        // According to mozzila, this method is deprecated, but I can't find a source on that.
        // https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
        getCoalescedEvents(): PointerEvent[]
    }

    interface Window {
        PointerEvent: typeof PointerEvent
    }
}

export interface PointerInput {
    readonly x: number
    readonly y: number
    readonly pressure: number
    readonly shift: boolean
    readonly alt: boolean
    readonly ctrl: boolean
    readonly time: number
}

export interface Listeners {
    click(input: PointerInput): void
    move(input: readonly PointerInput[]): void
    drag(input: readonly PointerInput[]): void
    release(input: PointerInput): void
}

export type RemoveListeners = () => void

export function listen(canvas: HTMLCanvasElement, listeners: Listeners): RemoveListeners {
    if (window.PointerEvent !== undefined) {
        return listenForPointers(canvas, listeners)
    } else {
        // Add touch as well?
        return listenForMouse(canvas, listeners)
    }
}

const pointerSupportsPressure: { [pointerId: number]: boolean } = {}

function checkPressureSupport(ev: PointerEvent): void {
    if (ev.pressure === 0.5) return
    if (pointerSupportsPressure[ev.pointerId]) return

    pointerSupportsPressure[ev.pointerId] = true
}

function getPressure(ev: PointerEvent): number {
    return pointerSupportsPressure[ev.pointerId]
        ? ev.pressure
        : ev.pressure === 0.5
        ? 1.0
        : ev.pressure
}

const uncoalesce = (() => {
    if (PointerEvent.prototype.getCoalescedEvents === undefined) {
        return (ev: PointerEvent) => [ev]
    }
    return (ev: PointerEvent) => {
        const coalescedEvents = ev.getCoalescedEvents()
        return coalescedEvents
    }
})()

function localizePointer(
    time: number,
    event: PointerEvent,
    // we get the pressure off of the original event because firefox's coalesced events have a bug which causes them to always be 0
    originalEvent: PointerEvent
): PointerInput {
    return {
        x: event.x,
        y: event.y,
        pressure: getPressure(originalEvent),
        shift: event.shiftKey,
        alt: event.altKey,
        ctrl: event.ctrlKey,
        time,
    }
}

function uncoalesceAndLocalize(time: number, originalEvent: PointerEvent): PointerInput[] {
    const events = uncoalesce(originalEvent)
    const result = new Array<PointerInput>(events.length)
    for (let i = 0; i < events.length; i++) {
        // we need to deal with pressure
        result[i] = localizePointer(time, events[i], originalEvent)
    }
    return result
}

function listenForPointers(canvas: HTMLCanvasElement, listeners: Listeners): RemoveListeners {
    const pointerDown = (ev: PointerEvent) => {
        if (ev.button === 1 || ev.button === 2) {
            return
        }
        const time = performance.now()
        listeners.click(localizePointer(time, ev, ev))
    }

    const pointerUp = (ev: PointerEvent) => {
        const time = performance.now()
        listeners.release(localizePointer(time, ev, ev))
    }

    const pointerMove = (ev: PointerEvent) => {
        const time = performance.now()
        listeners.move(uncoalesceAndLocalize(time, ev))
        // listeners.move([localizePointer(bounds, time, ev)])

        if (ev.pressure > 0) {
            listeners.drag(uncoalesceAndLocalize(time, ev))
            // listeners.drag([localizePointer(bounds, time, ev)])
        }
    }

    window.addEventListener("pointerdown", checkPressureSupport)
    canvas.addEventListener("pointerdown", pointerDown)
    window.addEventListener("pointerup", pointerUp)
    window.addEventListener("pointermove", pointerMove)

    return () => {
        window.removeEventListener("pointerdown", checkPressureSupport)
        canvas.removeEventListener("pointerdown", pointerDown)
        window.removeEventListener("pointerup", pointerUp)
        window.removeEventListener("pointermove", pointerMove)
    }
}

function listenForMouse(canvas: HTMLCanvasElement, listeners: Listeners): RemoveListeners {
    let isDown = false

    const mouseDown = (ev: MouseEvent) => {
        if (ev.button === 1 || ev.button === 2) {
            return
        }
        const time = performance.now()
        listeners.click(localizeMouse(time, ev, false))
        isDown = true
    }

    const mouseUp = (ev: MouseEvent) => {
        const time = performance.now()
        listeners.release(localizeMouse(time, ev, true))
        isDown = false
    }
    const mouseMove = (ev: MouseEvent) => {
        const time = performance.now()
        listeners.move([localizeMouse(time, ev, false)])

        if (isDown) {
            listeners.drag([localizeMouse(time, ev, false)])
        }
    }

    canvas.addEventListener("mousedown", mouseDown)
    window.addEventListener("mouseup", mouseUp)
    window.addEventListener("mousemove", mouseMove)

    return () => {
        canvas.removeEventListener("mousedown", mouseDown)
        window.removeEventListener("mouseup", mouseUp)
        window.removeEventListener("mousemove", mouseMove)
    }
}

function localizeMouse(time: number, ev: MouseEvent, isRelease: boolean): PointerInput {
    return {
        x: ev.x,
        y: ev.y,
        pressure: isRelease ? 0.0 : 1.0,
        shift: ev.shiftKey,
        alt: ev.altKey,
        ctrl: ev.ctrlKey,
        time,
    }
}
