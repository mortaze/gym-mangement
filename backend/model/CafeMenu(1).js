// backend\model\CafeMenu.js
const mongoose = require("mongoose");

const CafeMenuSchema = mongoose.Schema(
  {
    productId: {
      type: Number,
      required: true,
      unique: true, // همون id که فرستادی (103)
    },
    category: {
      type: String,
      required: [true, "Please provide product category"],
      trim: true,
      maxLength: 50,
    },
    name: {
      type: String,
      required: [true, "Please provide product name"],
      trim: true,
      maxLength: 150,
    },
    price: {
      type: Number,
      required: [true, "Please provide product price"],
      min: 0,
    },
    img: {
      type: String, // URL عکس
      required: true,
    },
    kcal: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["available", "unavailable"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

const CafeMenu = mongoose.model("CafeMenu", CafeMenuSchema);
module.exports = CafeMenu;
