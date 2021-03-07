const router = require("express").Router();

const {
  createItem,
  fetchItems,
  fetchItemById,
  updateItem,
  fetchItemNames,
} = require("../controllers/item");

router.post("/additem", createItem);
router.get("/items", fetchItems);
router.get("/item/:id", fetchItemById);
router.put("/updateitem", updateItem);
router.get("/fetchitemnames", fetchItemNames);

module.exports = router;
