import express from 'express';
import path from 'path';
import { initDatabase } from '../database/sqlite';
import { SqliteProductRepository } from '../database/SqliteProductRepository';
import { SqliteOrderRepository } from '../database/SqliteOrderRepository';
import { createProductRouter } from './routes/productRoutes';
import { createOrderRouter } from './routes/orderRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.resolve(__dirname, '../../../public')));


const productRepository = new SqliteProductRepository();
const orderRepository = new SqliteOrderRepository();

app.use('/api/products', createProductRouter(productRepository));
app.use('/api/orders', createOrderRouter(orderRepository, productRepository));

async function startServer() {
  try {
    await initDatabase();
    app.listen(port, () => {
      console.log(`====================================================`);
      console.log(` Servidor de la Tienda corriendo en http://localhost:${port}`);
      console.log(` Para usar dominio local, mapea tienda.local en hosts`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Error inicializando el servidor:', error);
    process.exit(1);
  }
}

startServer();
