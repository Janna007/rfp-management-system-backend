import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import logger from "./config/logger";
import { HttpError } from "http-errors";

/**
 * Routes
 */
import rfpRouter from "./routers/rfp";
import vendorRouter from "./routers/vendor";

const app = express();

// app.use(cors())
app.use(express.json());

app.use("/api/rfp", rfpRouter);
app.use("/api/vendor", vendorRouter);

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    errors: [
      {
        type: err.name,
        msg: err.message,
        path: "",
        location: "",
      },
    ],
  });
});

export default app;
