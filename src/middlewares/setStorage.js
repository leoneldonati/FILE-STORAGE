import { getStorageInstance } from "../utils/getStorageInstance.js";
import logger from "../logger.js";
function setStorage(req, res, next) {
  const query = req.query;

  if (!query?.dbName) {
    res.status(400).json({
      error: true,
      data: null,
      message:
        "Debes proporcionar el nombre de la base de datos que deseas conectarte",
    });

    return;
  }
  try {
    const dbName = query.dbName;
    req.storage = getStorageInstance(dbName); //<-- GUARDAR INSTANCIA DEL STORAGE EN LA REQUEST
    next();
  } catch (error) {
    logger.error(`Error accessing database: ${error.message}`);
    res.status(400).json({ error: true, data: null, message: error.message });
  }
}

export { setStorage };
