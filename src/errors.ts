export class FieldNotInSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FieldNotInSchemaError";
  }
}

export class FunctionNotAllowedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FunctionNotAllowedError";
  }
}
