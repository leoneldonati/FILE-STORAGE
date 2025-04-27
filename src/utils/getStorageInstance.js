import DataStorage from "../db/DataStorage.js";
import logger from "../logger.js";

// Mapa para cachear instancias de DataStorage por dbName
const storageInstances = new Map();
// Función para obtener o crear una instancia de DataStorage
function getStorageInstance(dbName) {
  // Validar dbName para evitar inyecciones de ruta
  const regex = /^[a-zA-Z0-9_-]+$/;
  if (!regex.test(dbName)) {
    throw new Error("Invalid database name");
  }

  if (!storageInstances.has(dbName)) {
    const config = {
      dbName,
      backupConfig: {
        enabled: true,
        maxBackups: parseInt(process.env.MAX_BACKUPS, 10) || 5,
      },
    };
    const storage = new DataStorage(config);
    storageInstances.set(dbName, storage);
    logger.info(`Created DataStorage instance for ${dbName}`);
  }

  return storageInstances.get(dbName);
}

export { getStorageInstance };
