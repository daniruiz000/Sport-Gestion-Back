import { Request, Response, NextFunction } from "express";
import { teamOdm } from "../odm/team.odm";
import { userOdm } from "../odm/user.odm";

export const getTeams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // ADMIN
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const teams = await teamOdm.getAllTeams(page, limit);

    const newTeams = [];
    for (const team of teams) {
      const manager = await userOdm.getManagerByIdTeam(team.id);
      const newTeam = {
        team,
        manager,
      };
      newTeams.push(newTeam);
    }
    const totalElements = await teamOdm.getTeamCount();

    const response = {
      totalItems: totalElements,
      totalPages: Math.ceil(totalElements / limit),
      currentPage: page,
      data: newTeams,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getTeamById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //  ADMIN
    const teamId = req.params.id;
    if (req.user.rol !== "ADMIN" && req.user.team?.toString() !== teamId) {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }
    const team = await teamOdm.getTeamById(teamId);
    if (!team) {
      res.status(404).json({ error: "No existe el equipo" });
      return;
    }
    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const getTeamByName = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  const name = req.params.name;

  try {
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }
    const team = await teamOdm.getTeamByName(name);
    if (!team) {
      res.status(404).json({ error: "No existe el equipo" });
    }
    res.json(team);
  } catch (error) {
    next(error);
  }
};

export const createTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sólo ADMIN
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const createdTeam = await teamOdm.createTeam(req.body);
    res.status(201).json(createdTeam);
  } catch (error) {
    next(error);
  }
};

export const deleteTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Sólo ADMIN
    const id = req.params.id;
    if (req.user.rol !== "ADMIN") {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const teamDeleted = await teamOdm.deleteTeam(id);
    if (!teamDeleted) {
      res.status(404).json({ error: "No existe el equipo" });
      return;
    }
    res.json(teamDeleted);
  } catch (error) {
    next(error);
  }
};

export const updateTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id;
    // Sólo ADMIN y MANAGER
    if (req.user.rol !== "ADMIN" && req.user.rol !== "MANAGER" && req.user.team !== id) {
      res.status(401).json({ error: "No tienes autorización para realizar esta operación" });
      return;
    }

    const teamToUpdate = await teamOdm.getTeamById(id);
    if (!teamToUpdate) {
      res.status(404).json({ error: "No existe el equipo" });
      return;
    }

    // Guardamos el equipo actualizandolo con los parametros que nos manden
    Object.assign(teamToUpdate, req.body);
    const teamToSend = await teamToUpdate.save();
    res.json(teamToSend);
  } catch (error) {
    next(error);
  }
};

export const teamService = {
  getTeams,
  getTeamById,
  getTeamByName,
  createTeam,
  deleteTeam,
  updateTeam,
};
