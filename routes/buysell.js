const express = require("express");
const router = express.Router();
const { addItem, myItems , allItems,deleteItem } = require('../controllers/buysell');
const { requireSignin } = require("../middlewares/auth");
const {
    isRequestValidated,
} = require("../validators/auth");
router.post("/college-olx/addItem",requireSignin,isRequestValidated,addItem);
router.get("/college-olx/myItem",requireSignin,isRequestValidated,myItems);
router.get("/college-olx/allItems",requireSignin,isRequestValidated,allItems);
router.delete("/college-olx/deleteItem",requireSignin,isRequestValidated,deleteItem);

module.exports = router;