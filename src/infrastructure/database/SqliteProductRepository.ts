import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { queryAll, queryGet, queryRun } from './sqlite';

interface SqliteProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export class SqliteProductRepository implements ProductRepository {
  public async findAll(storeId?: string): Promise<Product[]> {
    const rows = await queryAll<SqliteProductRow>('SELECT * FROM products');
    return rows.map(r => new Product(r.id, r.name, r.description, r.price, r.stock));
  }

  public async findById(id: string, storeId?: string): Promise<Product | null> {
    const row = await queryGet<SqliteProductRow>('SELECT * FROM products WHERE id = ?', [id]);
    if (!row) return null;
    return new Product(row.id, row.name, row.description, row.price, row.stock);
  }

  public async save(product: Product, storeId?: string): Promise<void> {
    await queryRun(
      `INSERT OR REPLACE INTO products (id, name, description, price, stock) 
       VALUES (?, ?, ?, ?, ?)`,
      [product.id, product.name, product.description, product.price, product.stock]
    );
  }

  public async delete(id: string, storeId?: string): Promise<void> {
    await queryRun('DELETE FROM products WHERE id = ?', [id]);
  }
}

