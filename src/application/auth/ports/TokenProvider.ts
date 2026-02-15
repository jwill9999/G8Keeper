export interface TokenProvider {
  generate(userId: string, email: string): string;
  verify(token: string): { id: string; email: string } | null;
}
