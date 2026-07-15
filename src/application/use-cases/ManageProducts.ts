import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';

export class ManageProducts {
  constructor(private productRepository: ProductRepository) {}

  public async getCatalog(storeId?: string): Promise<Product[]> {
    return this.productRepository.findAll(storeId);
  }

  public async getProductDetails(id: string, storeId?: string): Promise<Product | null> {
    return this.productRepository.findById(id, storeId);
  }

  public async addProduct(
    id: string,
    name: string,
    description: string,
    price: number,
    stock: number,
    storeId?: string
  ): Promise<Product> {
    const product = new Product(id, name, description, price, stock);
    await this.productRepository.save(product, storeId);
    return product;
  }

  public async deleteProduct(id: string, storeId?: string): Promise<void> {
    const product = await this.productRepository.findById(id, storeId);
    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }
    await this.productRepository.delete(id, storeId);
  }
}

