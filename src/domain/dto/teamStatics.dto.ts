import { IMatchCreate } from "../entities/match-entity";
import { ITeamsStatistics } from "../entities/team-entity";

const initializeTeamStatic = (teamId: string, teamName: string, teamInitials: string, teamImage: string): ITeamsStatistics => ({
  id: teamId,
  name: teamName,
  initials: teamInitials,
  image: teamImage,
  matchesPlayed: 0,
  matchesWon: 0,
  matchesLost: 0,
  matchesDrawn: 0,
  points: 0,
  goalsFor: 0,
  goalsAgainst: 0,
  position: 0,
});

const updateTeamStatistics = (teamStatics: ITeamsStatistics, goalsFor: number, goalsAgainst: number, points: number, matchResult: string): void => {
  teamStatics.goalsFor += goalsFor;
  teamStatics.goalsAgainst += goalsAgainst;
  teamStatics.matchesPlayed++;

  switch (matchResult) {
    case "win":
      teamStatics.points += points;
      teamStatics.matchesWon++;
      break;
    case "loss":
      teamStatics.matchesLost++;
      break;
    case "draw":
      teamStatics.points++;
      teamStatics.matchesDrawn++;
      break;
  }
};

const updateTeamsStatisticsPerMatch = (match: IMatchCreate, localTeamStatics: ITeamsStatistics, visitorTeamStatics: ITeamsStatistics): void => {
  if (match.played && match.goalsLocal && match.goalsVisitor) {
    const localGoals = match.goalsLocal.length || 0;
    const visitorGoals = match.goalsVisitor.length || 0;

    if (localGoals > visitorGoals) {
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 3, "win");
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 0, "loss");
    } else if (localGoals < visitorGoals) {
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 3, "win");
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 0, "loss");
    } else {
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 1, "draw");
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 1, "draw");
    }
  }
};

const sortTeamStatisticsByPointsAndAddPosition = (teamStatics: Record<string, ITeamsStatistics>): ITeamsStatistics[] => {
  const teamStatisticsLeague = Object.values(teamStatics);

  teamStatisticsLeague.sort((a, b) => b.points - a.points);

  teamStatisticsLeague.forEach((team, index) => {
    team.position = index + 1;
  });

  return teamStatisticsLeague;
};

const calculateTeamsStatisticsLeague = (matches: IMatchCreate[]): ITeamsStatistics[] => {
  const teamStatics: Record<string, ITeamsStatistics> = {};

  for (const match of matches) {
    const { _id: localTeamId, name: localTeamName, initials: localTeamInitials, image: localTeamImage } = match.localTeam;
    const { _id: visitorTeamId, name: visitorTeamName, initials: visitorTeamInitials, image: visitorTeamImage } = match.visitorTeam;

    teamStatics[localTeamId] = teamStatics[localTeamId] || teamStatisticsDto.initializeTeamStatic(localTeamId, localTeamName, localTeamInitials, localTeamImage as string);
    teamStatics[visitorTeamId] = teamStatics[visitorTeamId] || teamStatisticsDto.initializeTeamStatic(visitorTeamId, visitorTeamName, visitorTeamInitials, visitorTeamImage as string);

    const localTeam = teamStatics[localTeamId];
    const visitorTeam = teamStatics[visitorTeamId];

    teamStatisticsDto.updateTeamsStatisticsPerMatch(match, localTeam, visitorTeam);
  }

  const teamStatisticsLeague = sortTeamStatisticsByPointsAndAddPosition(teamStatics);

  return teamStatisticsLeague;
};

export const teamStatisticsDto = {
  initializeTeamStatic,
  updateTeamStatistics,
  updateTeamsStatisticsPerMatch,
  sortTeamStatisticsByPointsAndAddPosition,
  calculateTeamsStatisticsLeague,
};
