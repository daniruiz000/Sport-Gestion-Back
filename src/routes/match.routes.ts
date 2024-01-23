import express from "express";

import { decodedUserToken } from "../server/decodedUserToken.middleware";
import { matchService } from "../domain/services/match.service";
import { checkPaginatedParams } from "../server/checkPaginatedParams.middleware";

export const matchRouter = express.Router();

matchRouter.get("/calculate-statics", matchService.calculateTeamStatistics);
matchRouter.get("/matchall", matchService.getAllMatchs);
matchRouter.get("/", checkPaginatedParams, matchService.getMatchs);
matchRouter.get("/:id", matchService.getMatchById);
matchRouter.post("/", decodedUserToken, matchService.createMatch);
matchRouter.delete("/:id", decodedUserToken, matchService.deleteMatch);
matchRouter.post("/generate-league", decodedUserToken, matchService.generateLeague);
matchRouter.put("/:id", decodedUserToken, matchService.updateMatch);
/**
 * @swagger
 * tags:
 *   name: Match
 *   description: API para administrar partidos
 */

/**
 * @swagger
 * /match:
 *   get:
 *     summary: Obtener todos los partidos
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Cantidad de elementos a devolver
 *     responses:
 *       200:
 *         description: Lista de partidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /match/{id}:
 *   get:
 *     summary: Obtener un partido por ID
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del partido
 *     responses:
 *       200:
 *         description: Información del partido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /match:
 *   post:
 *     summary: Crear un nuevo partido
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchCreate'
 *     responses:
 *       201:
 *         description: Partido creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       400:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /match/{id}:
 *   delete:
 *     summary: Eliminar un partido por ID
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del partido
 *     responses:
 *       200:
 *         description: Partido eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       404:
 *         $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /match/{id}:
 *   put:
 *     summary: Actualizar un partido por ID
 *     tags: [Match]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del partido
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MatchCreate'
 *     responses:
 *       200:
 *         description: Partido actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       401:
 *         $ref: '#/components/schemas/Error'
 *       400:
 *         $ref: '#/components/schemas/Error'
 *       404:
 */

/** components:
 *   schemas:
 *     MatchCreate:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date-time
 *         localTeam:
 *           $ref: '#/components/schemas/Team'
 *         visitorTeam:
 *           $ref: '#/components/schemas/Team'
 *         goalsLocal:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         goalsVisitor:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *         played:
 *           type: boolean
 *         round:
 *           type: number
 *           minimum: 1
 *       required:
 *         - date
 *         - localTeam
 *         - visitorTeam
 *         - played
 *         - round
 *     Match:
 *       allOf:
 *         - $ref: '#/components/schemas/MatchCreate'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: ID del partido
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *           required:
 *             - _id
 *             - createdAt
 *             - updatedAt
 *     Team:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del equipo
 *         name:
 *           type: string
 *           description: Nombre del equipo
 *         initials:
 *           type: string
 *           description: Iniciales del equipo
 *         image:
 *           type: string
 *           description: URL de la imagen del equipo
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - _id
 *         - name
 *         - initials
 *         - createdAt
 *         - updatedAt
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del usuario
 *         name:
 *           type: string
 *           description: Nombre del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico del usuario
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - _id
 *         - name
 *         - email
 *         - createdAt
 *         - updatedAt
 *     Pagination:
 *       type: object
 *       properties:
 *         totalItems:
 *           type: number
 *           description: Total de elementos
 *         totalPages:
 *           type: number
 *           description: Total de páginas
 *         currentPage:
 *           type: number
 *           description: Página actual
 *         pageSize:
 *           type: number
 *           description: Tamaño de página
 *       required:
 *         - totalItems
 *         - totalPages
 *         - currentPage
 *         - pageSize
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Mensaje de error
 *       required:
 *         - message
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
