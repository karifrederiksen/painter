

export const doSomethingNumber = (x: number) => (y: number) => x*y;

var a = doSomethingNumber(3);
var b = a(2);
var c = 3;