import {
  readFile,
  writeFile,
  rename,
  readdir,
  unlink,
  mkdir,
} from "node:fs/promises";
import PQueue from "p-queue";
import path from "node:path";

export default class FileManager {
  constructor(filePath, backupConfig = { enabled: true, maxBackups: 5 }) {
    this.filePath = filePath;
    this.tempFilePath = path.join(
      path.dirname(filePath),
      `temp_${path.basename(filePath)}`
    );
    this.backupDir = path.join(
      path.dirname(filePath),
      "backups",
      path.basename(filePath, ".json")
    );
    this.backupConfig = backupConfig;
    this.queue = new PQueue({ concurrency: 1 });
  }

  async readFile() {
    return this.queue.add(async () => {
      try {
        const data = await readFile(this.filePath, "utf8");
        return JSON.parse(data || "[]");
      } catch (error) {
        if (error.code === "ENOENT") {
          return [];
        }
        throw new Error(`Error reading file: ${error.message}`);
      }
    });
  }

  async writeFile(data) {
    return this.queue.add(async () => {
      try {
        await writeFile(
          this.tempFilePath,
          JSON.stringify(data, null, 2),
          "utf8"
        );
        await rename(this.tempFilePath, this.filePath);
        if (this.backupConfig.enabled) {
          await this.createBackup(data);
        }
      } catch (error) {
        throw new Error(`Error writing file: ${error.message}`);
      }
    });
  }

  async createBackup(data) {
    try {
      // Crear directorio de backups si no existe
      await mkdir(this.backupDir, { recursive: true });
      // Generar nombre de archivo con timestamp (YYYYMMDDHHMMSS)
      const timestamp = new Date()
        .toISOString()
        .replace(/[-:T.]/g, "")
        .slice(0, 14);
      const backupPath = path.join(this.backupDir, `${timestamp}.json`);
      // Escribir respaldo
      await writeFile(backupPath, JSON.stringify(data, null, 2), "utf8");
      // Limpiar respaldos antiguos
      await this.cleanupBackups();
    } catch (error) {
      console.error(`Error creating backup: ${error.message}`);
    }
  }

  async cleanupBackups() {
    try {
      const files = await readdir(this.backupDir);
      const jsonFiles = files.filter((file) => file.endsWith(".json")).sort();
      if (jsonFiles.length > this.backupConfig.maxBackups) {
        const filesToDelete = jsonFiles.slice(
          0,
          jsonFiles.length - this.backupConfig.maxBackups
        );
        for (const file of filesToDelete) {
          await unlink(path.join(this.backupDir, file));
        }
      }
    } catch (error) {
      console.error(`Error cleaning up backups: ${error.message}`);
    }
  }

  async restoreBackup(timestamp) {
    return this.queue.add(async () => {
      try {
        const backupPath = path.join(this.backupDir, `${timestamp}.json`);
        const data = await readFile(backupPath, "utf8");
        const parsedData = JSON.parse(data || "[]");
        await writeFile(
          this.tempFilePath,
          JSON.stringify(parsedData, null, 2),
          "utf8"
        );
        await rename(this.tempFilePath, this.filePath);
        return parsedData;
      } catch (error) {
        throw new Error(`Error restoring backup: ${error.message}`);
      }
    });
  }

  async listBackups() {
    try {
      const files = await readdir(this.backupDir);
      return files.filter((file) => file.endsWith(".json")).sort();
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new Error(`Error listing backups: ${error.message}`);
    }
  }
}
