import { UserRepository } from '../../domain/repositories/UserRepository';
import { User } from '../../domain/entities/User';
import { queryGet, queryRun } from './mysql';

export class MysqlUserRepository implements UserRepository {
  public async findById(id: string, storeId: string = 'tienda1'): Promise<User | null> {
    const row = await queryGet<any>('SELECT * FROM users WHERE id = ? AND store_id = ?', [id, storeId]);
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.name, row.role);
  }

  public async findByEmail(email: string, storeId: string = 'tienda1'): Promise<User | null> {
    const row = await queryGet<any>('SELECT * FROM users WHERE email = ? AND store_id = ?', [email, storeId]);
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.name, row.role);
  }

  public async save(user: User, storeId: string = 'tienda1'): Promise<void> {
    const existing = await this.findById(user.id, storeId);
    if (existing) {
      await queryRun(
        'UPDATE users SET email = ?, password = ?, name = ?, role = ? WHERE id = ? AND store_id = ?',
        [user.email, user.passwordHash, user.name, user.role, user.id, storeId]
      );
    } else {
      await queryRun(
        'INSERT INTO users (id, email, password, name, role, store_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.name, user.role, storeId]
      );
    }
  }
}
