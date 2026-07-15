import { Product } from '../entities/Product';

export interface ProductRepository {
  findAll(storeId?: string): Promise<Product[]>;
  findById(id: string, storeId?: string): Promise<Product | null>;
  save(product: Product, storeId?: string): Promise<void>;
  delete(id: string, storeId?: string): Promise<void>;
}

