
// add functions to array
interface Array<T> {
	move(oldIdx: number, newIdx: number): Array<T>;
	find(predicate: any): T;
	includes(searchElement: T): boolean;
	of(...elements: T[]): T;
}


// http://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
Array.prototype.move = function (idx: number, newIdx: number) {
	if (newIdx >= this.length) {
		var k = newIdx - this.length;
		while ((k--) + 1) {
			this.push(undefined);
		}
	}
	this.splice(newIdx, 0, this.splice(idx, 1)[0]);
	return this;
};



// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
if (!Array.prototype.find) {
	Array.prototype.find = function (predicate: any) {
		if (this === null) {
			throw new TypeError('Array.prototype.find called on null or undefined');
		}
		if (typeof predicate !== 'function') {
			throw new TypeError('predicate must be a function');
		}
		var list = Object(this);
		var length = list.length >>> 0;
		var thisArg = arguments[1];
		var value: any;

		for (var i = 0; i < length; i++) {
			value = list[i];
			if (predicate.call(thisArg, value, i, list)) {
				return value;
			}
		}
		return undefined;
	}
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/of
if (!Array.prototype.of) {
	Array.prototype.of = function (...elements: any[]) {
		return Array.prototype.slice.call(elements);
	};
}


// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
if (!Array.prototype.includes) {
	Array.prototype.includes = function (searchElement) {
		var O = Object(this);
		var len = parseInt(O.length) || 0;
		if (len === 0) {
			return false;
		}
		var n = parseInt(arguments[1]) || 0;
		var k: number;
		if (n >= 0) {
			k = n;
		} else {
			k = len + n;
			if (k < 0) { k = 0; }
		}
		var currentElement: any;
		while (k < len) {
			currentElement = O[k];
			if (searchElement === currentElement ||
				(searchElement !== searchElement && currentElement !== currentElement)) { // NaN !== NaN
				return true;
			}
			k++;
		}
		return false;
	};
}



// bind F12 to stop code execution in chrome
window.addEventListener('keydown', (e: any) => {
	if (e.keyCode === 123) debugger;
});