import { ITeam } from "../entities/team-entity";

export const shuffleIteamArray = (teamList: ITeam[]): ITeam[] => {
  const newTeamList = [...teamList];
  for (let i = newTeamList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newTeamList[i], newTeamList[j]] = [newTeamList[j], newTeamList[i]];
  }
  return newTeamList;
};
