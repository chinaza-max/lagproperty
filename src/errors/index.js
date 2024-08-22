export class SystemError extends Error {
  constructor(code, message = "System Error") {
    super(message);
    this.name = "SystemError";
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends SystemError {
  constructor(message = "Not Found") {
    super("NotFoundError", message);
    this.name = "NotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class UnAuthorizedError extends SystemError {
  constructor(message = "UnAuthorizedError") {
    super("UnAuthorizedError", message);
    this.name = "UnAuthorizedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}



export class BadRequestError extends SystemError {
  constructor(message = "Bad RequestError") {
    super("BadRequestError", message);
    this.name = "BadRequestError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConflictError extends SystemError {
  constructor(message = "ConflictError") {
    super("ConflictError", message);
    this.name = "ConflictError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}


export class ServerError extends SystemError {
  constructor(message= ServerError) {
    super("server-error", message); 
    this.name = "ServerError";
    Object.setPrototypeOf(this, new.target.prototype); 
  }
}
