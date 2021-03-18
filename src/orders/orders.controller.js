const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
// Get all order objects in orders array
function list(req, res) {
  res.status(200).json({ data: orders });
}

// Add a new order to orders array
function create(req, res) {
  const { data } = req.body;

  const newOrder = {
    ...data,
    id: nextId(),
  };

  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
}

// Get order by id from orders array
function read(req, res) {
  const order = res.locals.order;

  res.status(200).json({ data: order });
}

// Update order in orders array
function update(req, res) {
  const order = res.locals.order;
  const { data } = req.body;

  if (order != data) {
    const index = orders.findIndex((item) => item.id == order.id);

    if (data.id) {
      orders[index] = {
        ...data,
      };
    } else {
      orders[index] = {
        ...data,
        id: order.id,
      };
    }

    res.status(200).json({ data: orders[index] });
  }

  res.status(200).json({ data: order });
}

// Delete order in orders array
function destroy(req, res) {
  const order = res.locals.order;
  const index = orders.findIndex((item) => item.id == order.id);

  orders.splice(index, -1);

  res.sendStatus(204);
}

// Validation methods --------------------------------------------
// Data stored in request body has all properties and is valid
function hasValidData(req, res, next) {
  const { data: { deliverTo, mobileNumber, dishes, status } = {} } = req.body;
  const validStatuses = [
    "pending",
    "preparing",
    "out-for-delivery",
    "delivered",
  ];

  if (!deliverTo)
    return next({ status: 400, message: `Order must include a deliverTo` });
  if (!mobileNumber)
    return next({ status: 400, message: `Order must include a mobileNumber` });
  if (!dishes)
    return next({ status: 400, message: `Order must include a dish` });
  if (!Array.isArray(dishes) || !dishes.length) {
    return next({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }

  if (req.method == "PUT") {
    if (status === "delivered")
      return next({
        status: 400,
        message: `A delivered order cannot be changed`,
      });
    if (!status || !validStatuses.includes(status))
      return next({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
  }

  dishes.forEach((dish, index) => {
    if (
      !dish.quantity ||
      dish.quantity <= 0 ||
      !Number.isInteger(dish.quantity)
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

  return next();
}

// orderId exists in orders array
function orderExists(req, res, next) {
  const { orderId } = req.params;

  const foundOrder = orders.find((order) => order.id == orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }

  next({ status: 404, message: `Order does not exist: ${orderId}` });
}

// No orderId mismatch in request body and url, if id exists in body
function idMatches(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id) {
    if (id != orderId)
      return next({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
      });
  }

  next();
}

// order status is only pending, for deletion
function checkStatus(req, res, next) {
  const order = res.locals.order;

  if (order.status !== "pending")
    return next({
      status: 400,
      message: "An order cannot be deleted unless it is pending",
    });

  next();
}

module.exports = {
  destroy: [orderExists, checkStatus, destroy],
  update: [orderExists, idMatches, hasValidData, update],
  read: [orderExists, read],
  create: [hasValidData, create],
  list,
};
