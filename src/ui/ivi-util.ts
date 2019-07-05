import { createNativeEventSource, EventHandlerNode, nativeEventHandlerFactory } from "ivi"

import { NativeEventHandler } from "ivi/dist/typings/events/native_events"

export const MOUSE_ENTER_EVENT = createNativeEventSource<MouseEvent>("mouseenter")
export const MOUSE_LEAVE_EVENT = createNativeEventSource<MouseEvent>("mouseleave")

export const onMouseEnter: (
    handler: NativeEventHandler<MouseEvent>,
    capture?: boolean
) => EventHandlerNode<MouseEvent> = nativeEventHandlerFactory(MOUSE_ENTER_EVENT)

export const onMouseLeave: (
    handler: NativeEventHandler<MouseEvent>,
    capture?: boolean
) => EventHandlerNode<MouseEvent> = nativeEventHandlerFactory(MOUSE_LEAVE_EVENT)
