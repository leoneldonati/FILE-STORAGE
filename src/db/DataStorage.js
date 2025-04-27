import FileManager from "./FileManager.js";
import PQueue from "p-queue";

export default class DataStorage {
  constructor(config) {
    const { dbName, backupConfig = { enabled: true, maxBackups: 5 } } = config;
    const dbPath = `./data/${dbName}.json`;
    this.fileManager = new FileManager(dbPath, backupConfig);
    this.queue = new PQueue({ concurrency: 1 });
    this.cache = null;
    this.isCacheInitialized = false;
  }

  async initializeCache() {
    if (!this.isCacheInitialized) {
      this.cache = await this.fileManager.readFile();
      this.isCacheInitialized = true;
    }
  }

  async save(data) {
    return this.queue.add(async () => {
      await this.initializeCache();
      const _id = (new Date().getTime() + Math.random() ** 12).toFixed(0);
      const created_at = new Date();
      const recordWithId = { _id, ...data, created_at, updated_at: created_at };
      this.cache = [...this.cache, recordWithId];
      await this.fileManager.writeFile(this.cache);
      return recordWithId;
    });
  }

  async update(id, data) {
    return this.queue.add(async () => {
      await this.initializeCache();
      const record = this.cache.find((record) => record._id === id);
      if (!record) throw new Error("Este producto no existe!");
      const { created_at, _id } = record;
      const updated_at = new Date();
      const updatedRecord = { ...data, updated_at, created_at, _id };
      this.cache = this.cache.map((record) =>
        record._id === id ? updatedRecord : record
      );
      await this.fileManager.writeFile(this.cache);
      return updatedRecord;
    });
  }

  async get(id) {
    await this.initializeCache();
    const record = this.cache.find((record) => record._id === id);
    if (!record) throw new Error("¡Este producto no existe!");
    return record;
  }

  async getAll(limit = 50) {
    await this.initializeCache();
    return this.cache.slice(0, limit);
  }

  async delete(id) {
    return this.queue.add(async () => {
      await this.initializeCache();
      const recordIndex = this.cache.findIndex((record) => record._id === id);
      if (recordIndex === -1) return false;
      this.cache = this.cache.filter((record) => record._id !== id);
      await this.fileManager.writeFile(this.cache);
      return true;
    });
  }

  async invalidateCache() {
    this.isCacheInitialized = false;
    this.cache = null;
  }

  async restoreBackup(timestamp) {
    const restoredData = await this.fileManager.restoreBackup(timestamp);
    this.cache = restoredData; // Actualizar caché con datos restaurados
    this.isCacheInitialized = true;
    return restoredData;
  }

  async listBackups() {
    return this.fileManager.listBackups();
  }
}
