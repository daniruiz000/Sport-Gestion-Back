import { ITeam } from "../entities/team-entity";

export const shuffleIteamArray = (array: ITeam[]): ITeam[] => {
  const newArray = [...array]; // Crear una copia del array original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Intercambiar elementos aleatoriamente
  }
  return newArray;
}
