"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const conn_1 = __importDefault(require("./config/conn"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
const GoalRoutes_1 = __importDefault(require("./routes/GoalRoutes"));
const port = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('tiny'));
dotenv_1.default.config();
app.use('/api/v1/user', UserRoutes_1.default);
app.use('/api/v1/goal', GoalRoutes_1.default);
app.all('*', (req, res) => {
    return res.status(404).json({ message: 'Route not found' });
});
(0, conn_1.default)()
    .then(() => {
    try {
        app.listen(port, () => console.log(`Server listening & database connected on ${port}`));
    }
    catch (e) {
        console.log('Cannot connect to the server');
    }
})
    .catch((e) => {
    console.log('Invalid database connection...! ', +e);
});
