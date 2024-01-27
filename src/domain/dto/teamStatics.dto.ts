import { IMatchCreate, MatchResult } from "../entities/match-entity";

import { ITeamsStatistics } from "../entities/teamStatics-entity";

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

const updateTeamStatistics = (teamStatics: ITeamsStatistics, goalsFor: number, goalsAgainst: number, points: number, matchResult: MatchResult): void => {
  teamStatics.goalsFor += goalsFor;
  teamStatics.goalsAgainst += goalsAgainst;
  teamStatics.matchesPlayed++;

  switch (matchResult) {
    case MatchResult.WIN:
      teamStatics.points += points;
      teamStatics.matchesWon++;
      break;
    case MatchResult.LOSS:
      teamStatics.matchesLost++;
      break;
    case MatchResult.DRAW:
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
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 3, MatchResult.WIN);
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 0, MatchResult.LOSS);
    }

    if (localGoals < visitorGoals) {
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 3, MatchResult.WIN);
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 0, MatchResult.LOSS);
    }

    if (localGoals === visitorGoals) {
      teamStatisticsDto.updateTeamStatistics(localTeamStatics, localGoals, visitorGoals, 1, MatchResult.DRAW);
      teamStatisticsDto.updateTeamStatistics(visitorTeamStatics, visitorGoals, localGoals, 1, MatchResult.DRAW);
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

  const teamStatisticsLeague = teamStatisticsDto.sortTeamStatisticsByPointsAndAddPosition(teamStatics);

  return teamStatisticsLeague;
};

export const teamStatisticsDto = {
  initializeTeamStatic,
  updateTeamStatistics,
  updateTeamsStatisticsPerMatch,
  sortTeamStatisticsByPointsAndAddPosition,
  calculateTeamsStatisticsLeague,
};
