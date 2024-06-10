const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const ordersRouter = require('./routes/orders'); // Importar el enrutador de pedidos
const Order = require('./models/order'); // Importar el modelo Order
const app = express();
const PORT = 3007;

// Configurar el middleware para analizar solicitudes JSON
app.use(bodyParser.json());

// Configurar la ruta para las solicitudes a /orders
app.use('/orders', ordersRouter);

// Configurar el middleware para servir archivos estáticos desde la carpeta "public" y "views"
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

// Servir la página principal
app.get('/pagina_principal.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'pagina_principal.html'));
});

// Servir la página de pedidos
app.get('/orders.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'orders.html'));
});

// Ruta para obtener todas las órdenes
app.get('/orders/all', (req, res) => {
  Order.getAllOrders((err, orders) => {
    if (err) {
      return res.status(500).send('Error retrieving orders');
    }
    res.json(orders);
  });
});

// Ruta para crear una nueva orden
app.post('/orders/new', (req, res) => {
  const { tableNumber, items } = req.body;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal * 1.10;

  Order.createOrder(tableNumber, items, subtotal, total, (err, orderId) => {
    if (err) {
      return res.status(500).send('Error creating order');
    }
    res.json({ message: `Order ${orderId} created successfully` });
  });
});

// Ruta para actualizar un pedido
app.put('/orders/update/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const { tableNumber, items } = req.body;

  if (!tableNumber || !items || !Array.isArray(items)) {
    return res.status(400).send('Invalid input');
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal * 1.10;

  Order.updateOrder(orderId, tableNumber, items, subtotal, total, (err) => {
    if (err) {
      return res.status(500).send('Error updating order');
    }
    res.json({ message: `Pedido ${orderId} actualizado exitosamente` });
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Escuchar en el puerto especificado
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

