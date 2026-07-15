import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Product } from '../../domain/entities/Product';
import { queryAll, queryGet, queryRun } from './mysql';

interface MysqlProductRow {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: number;
}

export class MysqlProductRepository implements ProductRepository {
  public async findAll(storeId: string = 'tienda1'): Promise<Product[]> {
    const rows = await queryAll<MysqlProductRow>('SELECT * FROM products WHERE store_id = ?', [storeId]);
    return rows.map(r => new Product(r.id, r.name, r.description, Number(r.price), r.stock));
  }

  public async findById(id: string, storeId: string = 'tienda1'): Promise<Product | null> {
    const row = await queryGet<MysqlProductRow>('SELECT * FROM products WHERE id = ? AND store_id = ?', [id, storeId]);
    if (!row) return null;
    return new Product(row.id, row.name, row.description, Number(row.price), row.stock);
  }

  public async save(product: Product, storeId: string = 'tienda1'): Promise<void> {
    await queryRun(
      `INSERT INTO products (id, name, description, price, stock, store_id) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name), 
         description = VALUES(description), 
         price = VALUES(price), 
         stock = VALUES(stock)`,
      [product.id, product.name, product.description, product.price, product.stock, storeId]
    );
  }

  public async delete(id: string, storeId: string = 'tienda1'): Promise<void> {
    await queryRun('DELETE FROM products WHERE id = ? AND store_id = ?', [id, storeId]);
  }
}
