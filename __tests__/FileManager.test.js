import { describe, it, expect, beforeEach } from "@jest/globals";
import FileManager from "../src/FileManager.js";

describe("FileManager", () => {
  let fileManager;

  beforeEach(() => {
    fileManager = new FileManager("./data/test.json", {
      enabled: true,
      maxBackups: 3,
    });
  });

  it("should read empty array from non-existent file", async () => {
    const data = await fileManager.readFile();
    expect(data).toEqual([]);
  });

  it("should write and read data correctly", async () => {
    const testData = [{ id: 1, name: "Test" }];
    await fileManager.writeFile(testData);
    const data = await fileManager.readFile();
    expect(data).toEqual(testData);
  });

  it("should create a backup after writing", async () => {
    await fileManager.writeFile([{ id: 1, name: "Test" }]);
    const backups = await fileManager.listBackups();
    expect(backups.length).toBe(1);
    expect(backups[0]).toMatch(/^\d{14}\.json$/);
  });

  it("should respect maxBackups limit", async () => {
    // Escribir múltiples veces para generar respaldos
    for (let i = 0; i < 5; i++) {
      await fileManager.writeFile([{ id: i, name: `Test ${i}` }]);
    }
    const backups = await fileManager.listBackups();
    expect(backups.length).toBe(3); // maxBackups = 3
  });

  it("should restore a backup correctly", async () => {
    const testData1 = [{ id: 1, name: "Test 1" }];
    const testData2 = [{ id: 2, name: "Test 2" }];
    await fileManager.writeFile(testData1);
    const backups = await fileManager.listBackups();
    await fileManager.writeFile(testData2);
    await fileManager.restoreBackup(backups[0]);
    const data = await fileManager.readFile();
    expect(data).toEqual(testData1);
  });

  it("should handle errors when restoring non-existent backup", async () => {
    await expect(fileManager.restoreBackup("nonexistent.json")).rejects.toThrow(
      "Error restoring backup"
    );
  });

  it("should return empty array for non-existent backup directory", async () => {
    const backups = await fileManager.listBackups();
    expect(backups).toEqual([]);
  });
});
