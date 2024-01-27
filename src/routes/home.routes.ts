import express from "express";

import { homeService } from "../domain/services/home.service";

export const homeRouter = express.Router();

homeRouter.get("/", homeService.showHomePage);
homeRouter.get("*", homeService.showErrorPage);
