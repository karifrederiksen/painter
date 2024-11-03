class ResultBase {
    value = null;
    error = null;
}
export class Ok extends ResultBase {
    value;
    error;
    constructor(value) {
        super();
        this.value = value;
        this.error = null;
    }
    isOk() {
        return true;
    }
    isErr() {
        return false;
    }
    map(f) {
        return new Ok(f(this.value));
    }
    mapError() {
        return new Ok(this.value);
    }
    andThen(f) {
        return f(this.value);
    }
}
export class Err extends ResultBase {
    value;
    error;
    constructor(error) {
        super();
        this.value = null;
        this.error = error;
    }
    isOk() {
        return false;
    }
    isErr() {
        return true;
    }
    map() {
        return new Err(this.error);
    }
    mapError(f) {
        return new Err(f(this.error));
    }
    andThen() {
        return new Err(this.error);
    }
}
