import { rm } from "node:fs/promises";
import { beforeEach } from "@jest/globals";

beforeEach(async () => {
  // Eliminar el directorio data/ antes de cada prueba
  try {
    await rm("./data", { recursive: true, force: true });
  } catch (error) {
    console.error("Error cleaning 数据目录:", error);
  }
});
