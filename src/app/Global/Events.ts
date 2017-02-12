/*
	Global object for handling events. I don't yet know how extensively it will be used.

	This event module broadcasts events immediately, as opposed to storing them for later use.
*/
module TSPainter.Events {


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
		Remove a callback from the callback list for a specific event
	*/
	export function unsubscribe(id: ID, callback: Callback) {
		const idx = _callbacks[id].indexOf(callback);
		if (idx >= 0) {
			_callbacks[id].splice(idx, 1);
		}
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
			// Useful for debugging
			const keys = Object.keys(ID);
			console.warn([
				"Event ",  id, " \"", keys[(keys.length / 2) + id], "\"", " does not have any callbacks associated with it."
			].join(""));
		}
	}


	export enum ID {
		None,

		// Pointer events
		PointerDown,
		PointerUp,
		PointerMove,
		PointerDrag,

		// Other inputs (Keybinds, buttons, etc.)
		ButtonToolBrush,
		ButtonToolEraser,
		ButtonToolBlur,
	}
}