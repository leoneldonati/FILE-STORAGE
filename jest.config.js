export default {
  testEnvironment: "node",
  transform: {}, // No necesitamos transformadores para ESM
  testMatch: ["**/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["./__tests__/setup.js"],
  extensionsToTreatAsEsm: [], // Vacío para evitar conflictos
};
