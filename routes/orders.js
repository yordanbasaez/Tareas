const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const db = require('../db/connection');

// Ruta para ingresar un nuevo pedido
router.post('/new', (req, res) => {
  // Extraer los datos del cuerpo de la solicitud
  const { tableNumber, items } = req.body;
  
  // Verificar si los datos son válidos
  if (!tableNumber) {
    return res.status(400).send('Invalid input: tableNumber is required');
  }
  
  if (!items || !Array.isArray(items)) {
    return res.status(400).send('Invalid input: items should be a non-empty array');
  }

  // Calcular el subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Calcular el total incluyendo la propina del 10%
  const total = subtotal * 1.10;

  // Llamar a la función para crear el pedido en la base de datos
  Order.createOrder(tableNumber, items, subtotal, total, (err, orderId) => {
    if (err) {
      return res.status(500).send('Error creating order');
    }
    // Enviar una respuesta exitosa con el ID del pedido creado
    res.status(201).send(`Order created with ID: ${orderId}`);
  });
});

// Ruta para obtener todos los pedidos con sus elementos
router.get('/all', (req, res) => {
  // Consulta para obtener todos los pedidos con sus elementos
  const sql = `
      SELECT orders.*, order_items.name AS item_name, order_items.price AS item_price, order_items.quantity AS item_quantity
      FROM orders
      JOIN order_items ON orders.id = order_items.order_id;
  `;
  db.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching orders:', err);
          res.status(500).json({ error: 'Error fetching orders' });
      } else {
          res.json(results); // Enviar los resultados al cliente
      }
  });
});

// Ruta para actualizar un pedido existente
router.put('/:id', (req, res) => {
  const orderId = req.params.id;
  const { tableNumber, items } = req.body;
  
  // Validar datos
  if (!tableNumber || !items || !Array.isArray(items)) {
    return res.status(400).send('Invalid input');
  }
  
  // Calcular subtotal y total
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal * 1.10;
  
  // Actualizar el pedido en la base de datos
  Order.updateOrder(orderId, tableNumber, items, subtotal, total, (err) => {
    if (err) {
      return res.status(500).send('Error updating order');
    }
    
    // Enviar una respuesta exitosa
    res.status(200).send('Order updated successfully');
  });
});

module.exports = router;
