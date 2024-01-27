import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";

import { swaggerOptions } from "../swagger-options";

const specs = swaggerJSDoc(swaggerOptions);
const data = JSON.stringify(specs);
fs.writeFileSync("./swagger.json", data);

console.log("Swagger json generado correctamente");
