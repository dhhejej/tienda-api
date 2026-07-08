import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class ManageProducts {
  constructor(private productRepository: ProductRepository) {}

  public async getCatalog(): Promise<Product[]> {
    return this.productRepository.findAll();
  }

  public async getProductDetails(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  public async addProduct(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number
  ): Promise<Product> {
    const product = new Product(id, name, description, price, stock);
    await this.productRepository.save(product);
    return product;
  }

  public async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    await this.productRepository.delete(id);
  }
}

