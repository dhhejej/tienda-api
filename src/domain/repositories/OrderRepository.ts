import { Order } from '../entities/Order';

export interface OrderRepository {
  findAll(storeId?: string): Promise<Order[]>;
  findById(id: string, storeId?: string): Promise<Order | null>;
  findByUserId(userId: string, storeId?: string): Promise<Order[]>;
  save(order: Order, storeId?: string): Promise<void>;
}
