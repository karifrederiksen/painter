// =====================================

declare global {
    interface PointerEvent {
        // Experimental technology
        getCoalescedEvents(): ReadonlyArray<PointerEvent>
    }
}

// =====================================

export const supportsCoalescedEvents =
    PointerEvent && typeof PointerEvent.prototype.getCoalescedEvents === "function"

// Bug: in Firefox the coalesced events always have a pressure of 0
export function uncoalesce(sourceEvent: PointerEvent): ReadonlyArray<PointerEvent> {
    return sourceEvent.getCoalescedEvents()
}
