"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
(0, vitest_1.describe)('Health check API', () => {
    (0, vitest_1.it)('should return 200 and healthy status', async () => {
        const response = await (0, supertest_1.default)(app_1.app).get('/api/v1/health');
        (0, vitest_1.expect)(response.status).toBe(200);
        (0, vitest_1.expect)(response.body.data.status).toBe('ok');
        (0, vitest_1.expect)(response.body.data.database).toBe('connected');
    });
    (0, vitest_1.it)('should return 404 for unknown route', async () => {
        const response = await (0, supertest_1.default)(app_1.app).get('/api/unknown');
        (0, vitest_1.expect)(response.status).toBe(404);
        (0, vitest_1.expect)(response.body.error.code).toBe('NOT_FOUND');
    });
});
