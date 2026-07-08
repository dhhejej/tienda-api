import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class InMemoryProductRepository implements ProductRepository {
  private products: Map<string, Product> = new Map();

  constructor() {
    this.seedProducts();
  }

  public async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  public async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product ? this.cloneProduct(product) : null;
  }

  public async save(product: Product): Promise<void> {
    this.products.set(product.id, this.cloneProduct(product));
  }

  private cloneProduct(product: Product): Product {
    return new Product(
      product.id,
      product.name,
      product.description,
      product.price,
      product.stock
    );
  }

  private seedProducts(): void {
    const defaultProducts = [
      new Product('prod-1', 'Laptop Gamer Pro', 'Laptop con procesador i9 y tarjeta RTX 4080', 2500, 10),
      new Product('prod-2', 'Mouse Mecánico Inalámbrico', 'Mouse ergonómico con sensor óptico de 26k DPI', 120, 50),
      new Product('prod-3', 'Teclado Mecánico RGB', 'Teclado hot-swappable con switches lineares', 180, 25),
      new Product('prod-4', 'Monitor Curvo 34"', 'Monitor ultrawide 144Hz 1ms', 600, 15)
    ];

    for (const p of defaultProducts) {
      this.products.set(p.id, p);
    }
  }

  public async delete(id: string): Promise<void> {
    this.products.delete(id);
  }
}

