import { Router, Request, Response } from 'express';
import { ManageOrders } from '../../../application/use-cases/ManageOrders';
import { OrderRepository } from '../../../domain/repositories/OrderRepository';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';

export function createOrderRouter(
  orderRepository: OrderRepository,
  productRepository: ProductRepository
): Router {
  const router = Router();
  const manageOrders = new ManageOrders(orderRepository, productRepository);

  router.get('/', async (req: Request, res: Response) => {
    try {
      const orders = await manageOrders.getOrders();
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const order = await manageOrders.getOrderDetails(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required to create an order' });
      }
      const orderId = `order-${Date.now()}`;
      const order = await manageOrders.createOrder(orderId, { items });
      res.status(201).json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
