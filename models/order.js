const db = require('../db/connection');

// Crear una nueva orden
const createOrder = (tableNumber, items, subtotal, total, callback) => {
  if (!tableNumber || !items || !subtotal || !total) {
    return callback(new Error('Invalid input data'));
  }

  const insertOrderQuery = 'INSERT INTO orders (table_number, subtotal, total) VALUES (?, ?, ?)';
  db.query(insertOrderQuery, [tableNumber, subtotal, total], (insertOrderError, insertOrderResult) => {
    if (insertOrderError) {
      return callback(insertOrderError);
    }
    const orderId = insertOrderResult.insertId;
    insertOrderItems(orderId, items, callback);
  });
};

// Insertar items de una orden en la tabla order_items
const insertOrderItems = (orderId, items, callback) => {
  if (!orderId || !items || !Array.isArray(items)) {
    return callback(new Error('Invalid input data'));
  }

  const values = items.map(item => [orderId, item.name, item.price, item.quantity]);
  const insertItemsQuery = 'INSERT INTO order_items (order_id, name, price, quantity) VALUES ?';
  db.query(insertItemsQuery, [values], (insertItemsError) => {
    if (insertItemsError) {
      return callback(insertItemsError);
    }
    callback(null, orderId);
  });
};

// Obtener todas las órdenes
const getAllOrders = (callback) => {
  const sql = `
    SELECT orders.id, orders.table_number, orders.subtotal, orders.total, order_items.name AS item_name, order_items.price AS item_price, order_items.quantity AS item_quantity
    FROM orders
    JOIN order_items ON orders.id = order_items.order_id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return callback(err);
    }
    const orders = results.map(order => ({
      ...order
    }));
    callback(null, orders);
  });
};

// Actualizar una orden existente
const updateOrder = (orderId, tableNumber, items, subtotal, total, callback) => {
  if (!orderId || !tableNumber || !items || !subtotal || !total) {
    return callback(new Error('Invalid input data'));
  }

  const updateOrderQuery = 'UPDATE orders SET table_number = ?, subtotal = ?, total = ? WHERE id = ?';
  db.query(updateOrderQuery, [tableNumber, subtotal, total, orderId], (updateOrderError) => {
    if (updateOrderError) {
      return callback(updateOrderError);
    }

    const deleteOrderItemsQuery = 'DELETE FROM order_items WHERE order_id = ?';
    db.query(deleteOrderItemsQuery, [orderId], (deleteOrderItemsError) => {
      if (deleteOrderItemsError) {
        return callback(deleteOrderItemsError);
      }

      insertOrderItems(orderId, items, callback);
    });
  });
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrder
};
