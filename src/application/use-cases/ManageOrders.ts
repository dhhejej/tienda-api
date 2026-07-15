import { OrderRepository } from '../../domain/repositories/OrderRepository';
import { ProductRepository } from '../../domain/repositories/ProductRepository';
import { Order, OrderItem } from '../../domain/entities/Order';

export interface CreateOrderInput {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class ManageOrders {
  constructor(
    private orderRepository: OrderRepository,
    private productRepository: ProductRepository
  ) {}

  public async getOrders(userId?: string, storeId?: string): Promise<Order[]> {
    if (userId) {
      return this.orderRepository.findByUserId(userId, storeId);
    }
    return this.orderRepository.findAll(storeId);
  }

  public async getOrderDetails(id: string, storeId?: string): Promise<Order | null> {
    return this.orderRepository.findById(id, storeId);
  }

  public async createOrder(orderId: string, input: CreateOrderInput, userId?: string, storeId?: string): Promise<Order> {
    const orderItems: OrderItem[] = [];

    for (const itemInput of input.items) {
      const product = await this.productRepository.findById(itemInput.productId, storeId);
      if (!product) {
        throw new Error(`Product not found: ${itemInput.productId}`);
      }

      if (!product.hasStock(itemInput.quantity)) {
        throw new Error(`Insufficient stock for product ${product.name}. Requested: ${itemInput.quantity}, Available: ${product.stock}`);
      }

      product.decreaseStock(itemInput.quantity);
      await this.productRepository.save(product, storeId);

      orderItems.push({
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: itemInput.quantity
      });
    }

    const order = Order.create(orderId, orderItems, userId);
    await this.orderRepository.save(order, storeId);
    return order;
  }
}
