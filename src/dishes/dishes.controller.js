const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
// Get all dish objects in dishes array
function list(req, res) {
  res.status(200).json({ data: dishes });
}

// Add a new dish to dishes array
function create(req, res) {
  const { data } = req.body;

  const newDish = {
    ...data,
    id: nextId(),
  };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
}

// Get dish by id from dishes array
function read(req, res) {
  const dish = res.locals.dish;

  res.status(200).json({ data: dish });
}

// Update dish in dishes array
function update(req, res) {
  const dish = res.locals.dish;
  const { data } = req.body;

  if (dish != data) {
    const index = dishes.findIndex((item) => item.id == dish.id);

    if (data.id) {
      dishes[index] = {
        ...data,
      };
    } else {
      dishes[index] = {
        ...data,
        id: dish.id,
      };
    }

    res.status(200).json({ data: dishes[index] });
  }

  res.status(200).json({ data: dish });
}

// Validation methods --------------------------------------------
// Data stored in request body has name, description, price, image
function hasData(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (!name) return next({ status: 400, message: "Dish must include a name" });
  if (!description)
    return next({ status: 400, message: "Dish must include a description" });
  if (!price)
    return next({ status: 400, message: "Dish must include a price" });
  if (!image_url)
    return next({ status: 400, message: "Dish must include a image_url" });

  next();
}

// Data stored in request body is valid data
function dataIsValid(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  if (name == "")
    return next({ status: 400, message: "Dish must include a name" });
  if (description == "")
    return next({ status: 400, message: "Dish must include a description" });
  if (price <= 0 || !Number.isInteger(price))
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  if (image_url == "")
    return next({ status: 400, message: "Dish must include a image_url" });

  next();
}

// dishId exists in dishes array
function dishExists(req, res, next) {
  const { dishId } = req.params;

  const foundDish = dishes.find((dish) => dish.id == dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    next();
  }

  next({ status: 404, message: `Dish does not exist: ${dishId}` });
}

// No dishId mismatch in request body and url, if id exists in body
function idMatches(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (id) {
    if (id != dishId)
      return next({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      });
  }

  next();
}

module.exports = {
  update: [dishExists, hasData, dataIsValid, idMatches, update],
  read: [dishExists, read],
  create: [hasData, dataIsValid, create],
  list,
};
