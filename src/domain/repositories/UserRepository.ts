import { User } from '../entities/User';

export interface UserRepository {
  findById(id: string, storeId?: string): Promise<User | null>;
  findByEmail(email: string, storeId?: string): Promise<User | null>;
  save(user: User, storeId?: string): Promise<void>;
}
