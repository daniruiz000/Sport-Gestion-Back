// En un fichero de definición no se exporta ni importa nada
// Este fichero dice a TS que las Request de Express van a contener una propiedad usuario.

declare namespace Express {
  export interface Request {
    user: {
      rol: ROL;
      id?: string;
      team?: string;
    };
  }
}
