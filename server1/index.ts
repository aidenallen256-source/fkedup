import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { registerRoutes } from "./routes";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const server = registerRoutes(app);
const port = process.env.PORT ? Number(process.env.PORT) : 8787;
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});