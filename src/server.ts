import express, { Express, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { validateEmail } from "./validateEmail";
import swaggerUi from "swagger-ui-express";
import handleError from "./errorHandling/errorHandler";

const fs = require("fs");
const YAML = require("yaml");

const swaggerYaml = fs.readFileSync("./swagger.yaml", "utf8");
const swaggerDocument = YAML.parse(swaggerYaml);

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post("/check-email", validateEmail);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({ message: "Not Found" });
});

app.use(handleError);
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  handleError(err, req, res, next);
});

app.listen(port, () => {
  console.info(
    `💻 ${process.env.NODE_ENV} Server is running at localhost:${port}`
  );
});
