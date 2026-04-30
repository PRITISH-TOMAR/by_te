export class ShortCodeDBO {
  shortCode: string;
  counterID: number;

  constructor({
    shortCode,
    counterId,
  }: {
    shortCode: string;
    counterId: number;
  }) {
    this.shortCode = shortCode;
    this.counterID = counterId;
  }
}
