/*
	Global object for handling events. I don't yet know how extensively it will be used.

	This event module broadcasts events immediately, as opposed to storing them for later use.
*/
module TSPainter.Event {


	/*
		Object contains all the callbacks
	*/
	const _callbacks: { [id: number]: Callback[] } = {};


	/*
		Register a callback to an event id
	*/
	export function subscribe(id: ID, callback: Callback) {
		let callList = _callbacks[id];
		if (callList == null) {
			callList = [];
			_callbacks[id] = callList;
		}

		callList.push(callback);
	}

	/*
		Send an event to all registered callbacks
	*/
	export function broadcast(id: ID, arg: any) {
		const callList = _callbacks[id];

		if (callList != null) {
			// Call every callback
			for (let i = 0, ilen = callList.length; i < ilen; i++) {
				callList[i](arg);
			}
		}
		else {
			// Useful for detecting unused event IDs
			console.warn("Event " + id + " does not have any callbacks associated with it.");
		}

	}


	export enum ID {
		MOUSE_DOWN,
		MOUSE_UP,
		MOUSE_MOVE,
		MOUSE_DRAG
	}
}