export class AuthResponseDTO {
  userId: number;
  email: string;
  planType: string;
  token: string;

  constructor({
    userId,
    email,
    planType,
    token,
  }: {
    userId: number;
    email: string;
    planType: string;
    token: string;
  }) {
    this.userId = userId;
    this.email = email;
    this.planType = planType;
    this.token = token;
  }
}
