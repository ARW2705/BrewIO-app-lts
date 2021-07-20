export class CustomError extends Error {
  severity: number;
  userMessage: string;

  constructor(
    name: string,
    message: string,
    severity: number,
    userMessage: string
  ) {
    super(message);
    this.name = name;
    this.severity = severity;
    this.userMessage = userMessage;

    Object.setPrototypeOf(this, CustomError.prototype);
  }

}
