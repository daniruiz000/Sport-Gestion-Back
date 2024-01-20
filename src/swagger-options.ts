import { type SwaggerOptions } from "swagger-ui-express";

export const swaggerOptions: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tartinchis",
      version: "1.0.0",
      description: "This is a simple CRUD API of Tartichis",
      license: {
        name: "MIT",
        url: "http://mit.com",
      },
      contact: {
        name: "Los Chichos",
        url: "https://github.com/loschichos",
        email: "chichos@example.com",
      },
    },
    server: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/**/*.ts"],
};
