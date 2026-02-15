export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    private readonly passwordHash: string,
    public readonly name?: string,
    public readonly googleId?: string,
    public readonly createdAt?: Date,
  ) {}

  getPasswordHash(): string {
    return this.passwordHash;
  }
}
