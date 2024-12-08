import { z } from "zod";

const AddProductsToCartRequest = z.object({
  product_id: z.number(),
  quantity: z.number(),
});

const UpdateProductInCartRequest = z.object({
  quantity: z.number(),
});

const CheckoutRequest = z.object({
  product_ids: z.array(z.number()),
});

const UpdateCheckoutStatusRequest = z.object({
  status: z.enum(["PENDING", "DELIVERED", "CANCELLED", "COMPLETED"]),
});

export { AddProductsToCartRequest, UpdateProductInCartRequest, CheckoutRequest, UpdateCheckoutStatusRequest };
