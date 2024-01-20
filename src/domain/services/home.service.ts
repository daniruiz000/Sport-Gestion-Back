import { Request, Response, NextFunction } from "express";

export const showHomePage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.send(`
    <h3>Esta es la RAIZ de nuestra API de Sport-Gestion.</h3>
  `);
  } catch (error) {
    next(error);
  }
};

export const showErrorPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.status(404).send("Lo sentimos :( No hemos encontrado la página solicitada.");
  } catch (error) {
    next(error);
  }
};

export const homeService = {
  showHomePage,
  showErrorPage,
};
