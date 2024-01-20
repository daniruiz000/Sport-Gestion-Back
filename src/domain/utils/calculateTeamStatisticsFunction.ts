import { IMatchCreate } from "../entities/match-entity";
import { ITeamsStatistics } from "../entities/team-entity";

export const calculateTeamStatisticsFunction = async (matches: IMatchCreate[]): Promise<ITeamsStatistics[]> => {
  const teams: Record<string, ITeamsStatistics> = {};

  matches.forEach((match) => {
    const localTeamId = match.localTeam._id as string;
    const visitorTeamId = match.visitorTeam._id as string;

    if (!teams[localTeamId]) {
      teams[localTeamId] = {
        id: localTeamId,
        name: match.localTeam.name,
        initials: match.localTeam.initials,
        image: match.localTeam.image,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        position: 0,
      };
    }

    if (!teams[visitorTeamId]) {
      teams[visitorTeamId] = {
        id: visitorTeamId,
        name: match.visitorTeam.name,
        initials: match.visitorTeam.initials,
        image: match.visitorTeam.image,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        matchesDrawn: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        position: 0,
      };
    }

    const localTeam = teams[localTeamId];
    const visitorTeam = teams[visitorTeamId];

    if (match.played && match.goalsLocal && match.goalsVisitor) {
      localTeam.goalsFor += match.goalsLocal.length ? match.goalsLocal.length : 0;
      localTeam.goalsAgainst += match.goalsVisitor.length ? match.goalsVisitor.length : 0;

      visitorTeam.goalsFor += match.goalsVisitor.length ? match.goalsVisitor.length : 0;
      visitorTeam.goalsAgainst += match.goalsLocal.length ? match.goalsLocal.length : 0;

      localTeam.matchesPlayed++
      visitorTeam.matchesPlayed++

      if (match.goalsLocal.length > match.goalsVisitor.length) {
        localTeam.points += 3;
        localTeam.matchesWon++;
        visitorTeam.matchesLost++;
      } else if (match.goalsLocal.length < match.goalsVisitor.length) {
        visitorTeam.points += 3;
        visitorTeam.matchesWon++;
        localTeam.matchesLost++;
      } else if (match.goalsLocal.length === match.goalsVisitor.length) {
        localTeam.points++;
        localTeam.matchesDrawn++;
        visitorTeam.points++;
        visitorTeam.matchesDrawn++;
      }
    }
  }
  );

  const teamStatistics = Object.values(teams);

  // Ordenar el array en función de los puntos de cada equipo, de mayor a menor
  teamStatistics.sort((a, b) => b.points - a.points);

  // Asignar la posición correspondiente a cada equipo
  teamStatistics.forEach((team, index) => {
    team.position = index + 1;
  });

  return teamStatistics;
};
