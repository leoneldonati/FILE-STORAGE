import { describe, it, expect, beforeEach } from "@jest/globals";
import DataStorage from "../src/DataStorage.js";

describe("DataStorage", () => {
  let storage;

  beforeEach(() => {
    storage = new DataStorage({
      dbName: "test",
      backupConfig: { maxBackups: 3 },
    });
  });

  it("should save a record and assign _id, created_at, updated_at", async () => {
    const record = await storage.save({ name: "Producto 1", price: 100 });
    expect(record).toHaveProperty("_id");
    expect(record).toHaveProperty("created_at");
    expect(record).toHaveProperty("updated_at");
    expect(record.name).toBe("Producto 1");
    expect(record.price).toBe(100);
  });

  it("should get a record by id", async () => {
    const saved = await storage.save({ name: "Producto 1", price: 100 });
    const record = await storage.get(saved._id);
    expect(record).toEqual(saved);
  });

  it("should throw error for non-existent record", async () => {
    await expect(storage.get("nonexistent")).rejects.toThrow(
      "Este producto no existe!"
    );
  });

  it("should get all records with limit", async () => {
    await storage.save({ name: "Producto 1", price: 100 });
    await storage.save({ name: "Producto 2", price: 200 });
    const records = await storage.getAll(1);
    expect(records.length).toBe(1);
  });

  it("should update a record", async () => {
    const saved = await storage.save({ name: "Producto 1", price: 100 });
    const updated = await storage.update(saved._id, {
      name: "Producto 1 Mod",
      price: 150,
    });
    expect(updated.name).toBe("Producto 1 Mod");
    expect(updated.price).toBe(150);
    expect(updated.created_at).toEqual(saved.created_at);
    expect(new Date(updated.updated_at).getTime()).toBeGreaterThan(
      new Date(saved.updated_at).getTime()
    );
  });

  it("should throw error when updating non-existent record", async () => {
    await expect(
      storage.update("nonexistent", { name: "Test" })
    ).rejects.toThrow("Este producto no existe!");
  });

  it("should delete a record", async () => {
    const saved = await storage.save({ name: "Producto 1", price: 100 });
    const deleted = await storage.delete(saved._id);
    expect(deleted).toBe(true);
    await expect(storage.get(saved._id)).rejects.toThrow(
      "Este producto no existe!"
    );
  });

  it("should return false when deleting non-existent record", async () => {
    const deleted = await storage.delete("nonexistent");
    expect(deleted).toBe(false);
  });

  it("should use cache for reads", async () => {
    const saved = await storage.save({ name: "Producto 1", price: 100 });
    const record1 = await storage.get(saved._id);
    const record2 = await storage.get(saved._id);
    expect(record1).toBe(record2); // Deben ser el mismo objeto (caché)
  });

  it("should invalidate cache and reload data", async () => {
    await storage.save({ name: "Producto 1", price: 100 });
    await storage.invalidateCache();
    const records = await storage.getAll();
    expect(records.length).toBe(1);
  });

  it("should create and restore backups", async () => {
    await storage.save({ name: "Producto 1", price: 100 });
    const backups = await storage.listBackups();
    expect(backups.length).toBe(1);
    await storage.save({ name: "Producto 2", price: 200 });
    await storage.restoreBackup(backups[0]);
    const records = await storage.getAll();
    expect(records.length).toBe(1);
    expect(records[0].name).toBe("Producto 1");
  });

  it("should handle concurrent operations", async () => {
    const operations = [
      storage.save({ name: "Producto 1", price: 100 }),
      storage.save({ name: "Producto 2", price: 200 }),
      storage.save({ name: "Producto 3", price: 300 }),
    ];
    await Promise.all(operations);
    const records = await storage.getAll();
    expect(records.length).toBe(3);
  });
});
