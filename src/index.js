import express from "express";
import { port } from "./config.js";
import { productRoutes } from "./routes/products.js";
const app = express();

app.use(express.json());
app.use(productRoutes);
app.listen(port, () => {
  console.info(`Server running on: ${port}`);
});
