export class InvalidCredentialsError extends Error {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}

export class UserAlreadyExistsError extends Error {
  constructor() {
    super('User already exists');
    this.name = 'UserAlreadyExistsError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
