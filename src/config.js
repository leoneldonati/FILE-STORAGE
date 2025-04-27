import { config } from "dotenv";
config();

export const port = process.env.PORT || 3000;
export const maxBackups = process.env.MAX_BACKUPS || 5;
export const originsWhiteList = [];
