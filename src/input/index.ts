export interface DragState {
    readonly clickPoint: PointerInput
    readonly prevPoint: PointerInput
}

declare global {
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
    move(input: PointerInput): void
    drag(input: PointerInput): void
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

function listenForPointers(canvas: HTMLCanvasElement, listeners: Listeners): RemoveListeners {
    const pointerDown = (ev: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        listeners.click(localizePointer(bounds, time, ev))
    }

    const pointerUp = (ev: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        listeners.release(localizePointer(bounds, time, ev))
    }

    const pointerMove = (ev: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        //listeners.move(uncoalesceAndLocalize(bounds, ev))
        listeners.move(localizePointer(bounds, time, ev))

        if (ev.pressure > 0) {
            //listeners.drag(uncoalesceAndLocalize(bounds, ev))
            listeners.drag(localizePointer(bounds, time, ev))
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

function localizePointer(
    bounds: ClientRect | DOMRect,
    time: number,
    ev: PointerEvent
): PointerInput {
    const x = ev.x - bounds.left
    const y = ev.y - bounds.top

    return {
        x,
        y,
        pressure: getPressure(ev),
        shift: ev.shiftKey,
        alt: ev.altKey,
        ctrl: ev.ctrlKey,
        time,
    }
}

function listenForMouse(canvas: HTMLCanvasElement, listeners: Listeners): RemoveListeners {
    let isDown = false

    const mouseDown = (ev: MouseEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        listeners.click(localizeMouse(bounds, time, ev, false))
        isDown = true
    }

    const mouseUp = (ev: MouseEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        listeners.release(localizeMouse(bounds, time, ev, true))
        isDown = false
    }
    const mouseMove = (ev: MouseEvent) => {
        const bounds = canvas.getBoundingClientRect()
        const time = performance.now()
        listeners.move(localizeMouse(bounds, time, ev, false))

        if (isDown) {
            listeners.drag(localizeMouse(bounds, time, ev, false))
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

function localizeMouse(
    bounds: ClientRect | DOMRect,
    time: number,
    ev: MouseEvent,
    isRelease: boolean
): PointerInput {
    const x = ev.x - bounds.left
    const y = ev.y - bounds.top

    return {
        x,
        y,
        pressure: isRelease ? 0.0 : 1.0,
        shift: ev.shiftKey,
        alt: ev.altKey,
        ctrl: ev.ctrlKey,
        time,
    }
}
