import { z } from "zod";
import { addressSchema } from "./address";

export const checkoutSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  createAccount: z.boolean().default(false),
  password: z.string().min(8).optional(),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
}).refine(
  (data) => {
    if (data.createAccount && !data.password) {
      return false;
    }
    return true;
  },
  {
    message: "Password is required when creating an account",
    path: ["password"],
  }
);

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
