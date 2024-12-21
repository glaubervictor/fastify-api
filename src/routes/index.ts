import { FastifyTypedInstance } from "@/types.js";
import { userRoutes } from "./userRoutes.js";

export async function routes(app: FastifyTypedInstance) {
  await app.register(userRoutes);
}
