import { IUser } from "../entities/user-entity";

export const generateGoalIds = (players: IUser[], minId: number, maxId: number): IUser[] => {
  const goalIds: IUser[] = [];
  const numGoals = Math.floor(Math.random() * 4); // Generar un número aleatorio de goles

  for (let i = 0; i < numGoals; i++) {
    const playerId = Math.floor(Math.random() * (maxId - minId + 1)) + minId; // Generar un número aleatorio de ID de jugador
    goalIds.push(players[playerId].id);
  }

  return goalIds;
};
