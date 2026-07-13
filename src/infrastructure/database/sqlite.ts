import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../../database.sqlite');
const db = new sqlite3.Database(dbPath);


export function queryRun(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function queryGet<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve((row as T) || null);
    });
  });
}

export function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

export async function initDatabase(): Promise<void> {
  // Create products table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    )
  `);

  // Create orders table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `);

  // Create order items table
  await queryRun(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    )
  `);

  // Seed default products if empty
  const countRow = await queryGet<{ count: number }>('SELECT COUNT(*) as count FROM products');
  if (countRow && countRow.count === 0) {
    const defaultProducts = [
      ['prod-1', 'Laptop Gamer Pro', 'Laptop con procesador i9 y tarjeta RTX 4080', 35000, 10],
      ['prod-2', 'Mouse Mecánico Inalámbrico', 'Mouse ergonómico con sensor óptico de 26k DPI', 1200, 50],
      ['prod-3', 'Teclado Mecánico RGB', 'Teclado hot-swappable con switches lineares', 1800, 25],
      ['prod-4', 'Monitor Curvo 34"', 'Monitor ultrawide 144Hz 1ms', 8500, 15]
    ];

    for (const p of defaultProducts) {
      await queryRun('INSERT INTO products (id, name, description, price, stock) VALUES (?, ?, ?, ?, ?)', p);
    }
    console.log('Base de datos inicializada con productos semilla.');
  }
}

export { db };
