import { CustomError } from "../../server/checkError.middleware";
import { IMatchCreate } from "../entities/match-entity";
import { ITeamsStatistics } from "../entities/team-entity";
import { matchOdm } from "../odm/match.odm";
import { teamOdm } from "../odm/team.odm";
import { shuffleIteamArray } from "../utils/shuffleIteamArray";

const areTeamsStaticsCreated = (match: IMatchCreate, localTeamId: string, visitorTeamId: string, teamsStatics: Record<string, ITeamsStatistics>): void => {
  if (!teamsStatics[localTeamId]) {
    leagueDto.createTeamStatic(match, localTeamId, teamsStatics);
  }

  if (!teamsStatics[visitorTeamId]) {
    leagueDto.createTeamStatic(match, visitorTeamId, teamsStatics);
  }
};

const createTeamStatic = (match: IMatchCreate, teamId: string, teamsStatics: Record<string, ITeamsStatistics>): void => {
  if (!teamsStatics[teamId]) {
    teamsStatics[teamId] = {
      id: teamId,
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
};

export const refreshTeamStaticsListForThisMatch = (match: IMatchCreate, localTeamId: string, visitorTeamId: string, teamsStatics: Record<string, ITeamsStatistics>): void => {
  const localTeam = teamsStatics[localTeamId];
  const visitorTeam = teamsStatics[visitorTeamId];

  if (match.played && match.goalsLocal && match.goalsVisitor) {
    localTeam.goalsFor += match.goalsLocal.length ? match.goalsLocal.length : 0;
    localTeam.goalsAgainst += match.goalsVisitor.length ? match.goalsVisitor.length : 0;

    visitorTeam.goalsFor += match.goalsVisitor.length ? match.goalsVisitor.length : 0;
    visitorTeam.goalsAgainst += match.goalsLocal.length ? match.goalsLocal.length : 0;

    localTeam.matchesPlayed++;
    visitorTeam.matchesPlayed++;

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
};

export const sortedByPointsTeamStaticsList = (teamsStatics: Record<string, ITeamsStatistics>): ITeamsStatistics[] => {
  const teamStaticsSortedByPoints = Object.values(teamsStatics);

  teamStaticsSortedByPoints.sort((a, b) => b.points - a.points);

  teamStaticsSortedByPoints.forEach((team, index) => {
    team.position = index + 1;
  });

  return teamStaticsSortedByPoints;
};

const calculateLeagueStatisticsForTeamsAndSortByPosition = (matches: IMatchCreate[]): ITeamsStatistics[] => {
  const teamsStatics: Record<string, ITeamsStatistics> = {};

  for (const match of matches) {
    const localTeamId = match.localTeam._id;
    const visitorTeamId = match.visitorTeam._id;

    leagueDto.areTeamsStaticsCreated(match, localTeamId, visitorTeamId, teamsStatics);

    leagueDto.refreshTeamStaticsListForThisMatch(match, localTeamId, visitorTeamId, teamsStatics);
  }

  const leagueStatisticsForTeamsAndSortByPoints = leagueDto.sortedByPointsTeamStaticsList(teamsStatics);

  return leagueStatisticsForTeamsAndSortByPoints;
};

export const generateLeague = async (startDate: Date): Promise<IMatchCreate[]> => {
  const actualDate: Date = new Date();

  if (actualDate > startDate) {
    throw new CustomError("La fecha tiene que ser posterior a la actual", 400);
  }

  const teams = await teamOdm.getAllTeams();

  const shuffleTeamsArray = shuffleIteamArray(teams);
  const numTeams = shuffleTeamsArray.length;
  const numRoundsPerFase = numTeams - 1;
  let contDate = actualDate;

  if (numTeams === 0) {
    throw new CustomError("No hay equipos en la BBDD.", 400);
  }
  if (numTeams % 2 !== 0) {
    throw new CustomError("La cantidad de equipos para generar la liga es impar. Introduce un número par de equipos para generar la liga correctamente.", 400);
  }

  await matchOdm.deleteAllMatch();

  const createdMatches: IMatchCreate[] = [];

  // Generar los enfrentamientos de la primera vuelta
  for (let round = 0; round < numRoundsPerFase; round++) {
    const roundMatches: IMatchCreate[] = [];

    // Generar los partidos de la ronda actual
    for (let i = 0; i < numTeams / 2; i++) {
      const home = (round + i) % numTeams;
      const away = (numTeams - 1 - i + round) % numTeams;

      if (home === away) {
        // Evitar el enfrentamiento contra sí mismo
        continue;
      }

      const localTeam = shuffleTeamsArray[home];
      const visitorTeam = shuffleTeamsArray[away];
      const matchDate: Date = new Date(startDate.getTime() + round * 7 * 24 * 60 * 60 * 1000);

      const match: IMatchCreate = {
        date: matchDate,
        localTeam,
        visitorTeam,
        played: matchDate < actualDate,
        round: round + 1,
      };
      contDate = matchDate;
      roundMatches.push(match);
    }

    createdMatches.push(...roundMatches);
  }

  // Generar los enfrentamientos de la segunda vuelta
  for (let round = numRoundsPerFase - 1; round >= 0; round--) {
    const roundMatches: IMatchCreate[] = [];

    // Generar los partidos de la ronda actual
    for (let i = 0; i < numTeams / 2; i++) {
      const home = (numTeams - 1 - i + round) % numTeams;
      const away = (round + i) % numTeams;

      if (home === away) {
        // Evitar el enfrentamiento contra sí mismo
        continue;
      }

      const localTeam = shuffleTeamsArray[home];
      const visitorTeam = shuffleTeamsArray[away];

      const matchDate: Date = new Date(contDate.getTime() + round * 7 * 24 * 60 * 60 * 1000);

      const match: IMatchCreate = {
        date: matchDate,
        localTeam,
        visitorTeam,
        played: matchDate < actualDate,
        round: round + numRoundsPerFase + 1, // Se incrementa en 1 para indicar la ronda actual
      };

      roundMatches.push(match);
    }

    createdMatches.push(...roundMatches);
  }

  // Guardar los partidos en la base de datos.
  await matchOdm.createMatchsFromArray(createdMatches);
  const matchSort = createdMatches.sort((a, b) => a.round - b.round);
  for (let i = 0; i < matchSort.length; i++) {
    const match = createdMatches[i];
    const formattedDate = match.date.toLocaleDateString();
    const status = match.played ? "Jugado" : "Pendiente";
    console.log(`Jornada ${match.round} Partido: ${match.localTeam.name} / ${match.visitorTeam.name} Fecha ${formattedDate} - ${status}`);
  }
  console.log("Partidos generados correctamente.");
  console.log({
    createdMatchesNum: createdMatches.length,
    numRounds: numRoundsPerFase * 2,
    createdMatchesPerRound: numTeams / 2,
  });
  console.log("Liga generada correctamente.");
  return createdMatches;
};

export const leagueDto = {
  areTeamsStaticsCreated,
  createTeamStatic,
  refreshTeamStaticsListForThisMatch,
  sortedByPointsTeamStaticsList,
  calculateLeagueStatisticsForTeamsAndSortByPosition,
  generateLeague,
};
