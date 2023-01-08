const express = require("express");
const {
  updateHostProfile,
  forgotPassword,
  resetPassword,
  createProduct,
  unfavoriteProduct,
  favoriteProduct,
  searchProductsByLocation,
  searchProductsByFoodType,
  searchProductsByFavorites,
  createStore,
  getAllStores,
  getAllProducts,
} = require("../controllers/user.controller");
const { isAuthenticated } = require("../middleware/isAuthenticated");
const { upload } = require("../utils/cloudinary");
const router = express.Router();

router.put(
  "/update-host-profile",
  upload.single("image"),
  isAuthenticated,
  updateHostProfile
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/favorite-product/:productId", isAuthenticated, favoriteProduct);
router.post(
  "/unfavorite-product/:productId",
  isAuthenticated,
  unfavoriteProduct
);

router.post(
  "/product",
  upload.array("photos", 12),
  isAuthenticated,
  createProduct
);

router.get("/search-products", searchProductsByLocation);
router.get("/search-products-food", searchProductsByFoodType);

router.get(
  "/search-products-favorites",
  isAuthenticated,
  searchProductsByFavorites
);

router.post(
  "/create-store",
  upload.array("photos", 12),
  isAuthenticated,
  createStore
);

router.get("/stores", isAuthenticated, getAllStores);

router.get("/products", isAuthenticated, getAllProducts);

module.exports = router;
