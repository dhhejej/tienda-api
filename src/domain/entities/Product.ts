export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public stock: number
  ) {}

  public hasStock(quantity: number): boolean {
    return this.stock >= quantity;
  }

  public decreaseStock(quantity: number): void {
    if (!this.hasStock(quantity)) {
      throw new Error(`Insufficient stock for product: ${this.name}`);
    }
    this.stock -= quantity;
  }

  public increaseStock(quantity: number): void {
    this.stock += quantity;
  }
}
