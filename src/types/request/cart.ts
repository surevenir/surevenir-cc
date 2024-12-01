import { z } from "zod";

const AddProductsToCart = z.object({
  product_id: z.number(),
  quantity: z.number(),
});

const UpdateProductInCart = z.object({
  quantity: z.number(),
});

const Checkout = z.object({
  product_ids: z.array(z.number()),
});

export { AddProductsToCart, UpdateProductInCart };
