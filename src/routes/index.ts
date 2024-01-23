import swaggerUiExpress from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { swaggerOptions } from "../swagger-options";
import { type Express } from "express";

import { homeRouter } from "./home.routes";
import { userRouter } from "./user.routes";
import { teamRouter } from "./team.routes";
import { matchRouter } from "./match.routes";

import { infoReq } from "../server/infoReq.middleware";
import { connect } from "../server/connect.middleware";
import { checkError } from "../server/checkError.middleware";
import { disconnect } from "process";

export const configureRoutes = (app: Express): Express => {
  // Swagger
  const specs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

  app.use("/user", infoReq, connect, userRouter, disconnect);
  app.use("/team", infoReq, connect, teamRouter, disconnect);
  app.use("/match", infoReq, connect, matchRouter, disconnect);
  app.use("/", homeRouter);

  app.use(checkError);

  return app;
};
