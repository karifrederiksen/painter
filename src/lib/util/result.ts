export type Result<a, error> = Ok<a, error> | Err<a, error>;

abstract class ResultBase<a, error> {
  readonly value: a | null = null;
  readonly error: error | null = null;

  abstract isOk(): this is Ok<a, error>;
  abstract isErr(): this is Err<a, error>;
  abstract map<b>(f: (val: a) => b): Result<b, error>;
  abstract mapError<errorB>(f: (val: error) => errorB): Result<a, errorB>;
  abstract andThen<b>(f: (val: a) => Result<b, error>): Result<b, error>;
}

export class Ok<a, error> extends ResultBase<a, error> {
  readonly value: a;
  readonly error: null;

  constructor(value: a) {
    super();
    this.value = value;
    this.error = null;
  }

  isOk(): this is Ok<a, error> {
    return true;
  }

  isErr(): this is Err<a, error> {
    return false;
  }

  map<b>(f: (val: a) => b): Ok<b, error> {
    return new Ok(f(this.value));
  }

  mapError<errorB>(): Ok<a, errorB> {
    return new Ok(this.value);
  }

  andThen<b>(f: (val: a) => Result<b, error>): Result<b, error> {
    return f(this.value);
  }
}

export class Err<a, error> extends ResultBase<a, error> {
  readonly value: null;
  readonly error: error;

  constructor(error: error) {
    super();
    this.value = null;
    this.error = error;
  }

  isOk(): this is Ok<a, error> {
    return false;
  }

  isErr(): this is Err<a, error> {
    return true;
  }

  map<b>(): Err<b, error> {
    return new Err(this.error);
  }

  mapError<errorB>(f: (val: error) => errorB): Err<a, errorB> {
    return new Err(f(this.error));
  }

  andThen<b>(): Err<b, error> {
    return new Err(this.error);
  }
}
