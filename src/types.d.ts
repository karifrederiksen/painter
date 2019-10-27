interface PointerEvent {
    // According to mozzila, this method is deprecated, but I can't find a source on that.
    // https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
    getCoalescedEvents(): PointerEvent[]
}

interface Window {
    PointerEvent: typeof PointerEvent
}
