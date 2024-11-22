import express from "express";
import MerchantController from "../controllers/merchantController";
import authorizeAdmin from "../middlewares/authorizeAdmin";
import authenticate from "../middlewares/authenticate";

const merchantRouter = express.Router();

merchantRouter.get("/", authenticate, MerchantController.getAllMerchants);
merchantRouter.get("/:id", authenticate, MerchantController.getMerchantById);
merchantRouter.post(
  "/",
  authenticate,
  authorizeAdmin,
  MerchantController.createMerchant
);
merchantRouter.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  MerchantController.updateMerchant
);
merchantRouter.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  MerchantController.deleteMerchant
);

export default merchantRouter;
