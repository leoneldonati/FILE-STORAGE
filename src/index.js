import express from "express";
import { port } from "./config.js";
import { productRoutes } from "./routes/products.js";
import logger from "./logger.js";
import morgan from "morgan";
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(productRoutes);
app.listen(port, () => {
  logger.info(`Server running on: ${port}`);
});
