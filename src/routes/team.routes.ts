import express from "express";

import { isAuth } from "../domain/services/auth.middleware";
import { teamService } from "../domain/services/team.service";
import { checkParams } from "../server/checkParams.middleware";

export const teamRouter = express.Router();

teamRouter.get("/", checkParams, isAuth, teamService.getTeams);
teamRouter.get("/:id", isAuth, teamService.getTeamById);
teamRouter.get("/name/:name", isAuth, teamService.getTeamByName);
teamRouter.post("/", isAuth, teamService.createTeam);
teamRouter.delete("/:id", isAuth, teamService.deleteTeam);
teamRouter.put("/:id", isAuth, teamService.updateTeam);

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: API for managing teams
 */

/**
 * @swagger
 * /team:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of items to return
 *     responses:
 *       200:
 *         description: The list of teams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teams'
 *                   pagination:
 *                     $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid page or limit parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /team/{id}:
 *   get:
 *     summary: Get an team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 *       404:
 *         description: Teams not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /team/name/{name}:
 *   get:
 *     summary: Get an team by name
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: The team name
 *     responses:
 *       200:
 *         description: The team info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 *       404:
 *         description: Teams not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /team:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teams'
 *     responses:
 *       201:
 *         description: The team was created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 */

/**
 * @swagger
 * /team/{id}:
 *   delete:
 *     summary: Delete an team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     responses:
 *       200:
 *         description: The team was successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 *       404:
 *         description: The team was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /team/{id}:
 *   put:
 *     summary: Update an team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teams'
 *     responses:
 *       200:
 *         description: The team was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 *       400:
 *         description: Some parameters are missing or invalid
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: The team was not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /team/login:
 *   post:
 *     summary: Login as an team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teams'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
