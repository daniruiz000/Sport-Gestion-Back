import swaggerUiExpress from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
import { swaggerOptions } from "../swagger-options";

import express from "express";

import { homeRouter } from "./home.routes";
import { userRouter } from "./user.routes";
import { teamRouter } from "./team.routes";
import { matchRouter } from "./match.routes";

import { infoReq } from "../server/infoReq.middleware";
import { connect } from "../server/connect.middleware";
import { checkError } from "../domain/services/checkError.middleware";

export const configureRoutes = (app: any): any => {
  // Swagger
  const specs = swaggerJsDoc(swaggerOptions);
  app.use("/api-docs", swaggerUiExpress.serve, swaggerUiExpress.setup(specs));

  app.use(infoReq);
  app.use(connect);

  app.use("/user", userRouter);
  app.use("/team", teamRouter);
  app.use("/match", matchRouter);
  app.use("/public", express.static("public"));
  app.use("/", homeRouter);

  app.use(checkError);

  return app;
};
