"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const routes_1 = require("./routes");
const auth_middleware_1 = require("./middlewares/auth.middleware");
const recordatorios_cron_1 = require("./jobs/recordatorios.cron");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api', routes_1.apiRouter);
app.use('/api/admin', auth_middleware_1.requiereAutenticacion, routes_1.adminRouter);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend escuchando en puerto ${PORT}`);
    (0, recordatorios_cron_1.iniciarCronRecordatorios)();
});
