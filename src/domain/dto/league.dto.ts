import { CustomError } from "../../server/checkError.middleware";
import { IMatchCreate } from "../entities/match-entity";
import { ITeam, ITeamsStatistics } from "../entities/team-entity";
import { IUser } from "../entities/user-entity";
import { matchOdm } from "../odm/match.odm";
import { teamOdm } from "../odm/team.odm";

const validateAndParsedStartDate = (startDateString: string): Date => {
  const actualDate: Date = new Date();

  if (!startDateString) {
    throw new CustomError("Tiene que introducir una fecha de inicio con formato:'21/5/4' para realizar esta operación", 404);
  }

  const startDate = leagueDto.convertDateStringToDate(startDateString);

  if (actualDate > startDate) {
    throw new CustomError("La fecha tiene que ser posterior a la actual", 404);
  }

  return startDate;
};

export const convertDateStringToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/").map(Number);
  const fullYear = year < 100 ? year + 2000 : year;

  return new Date(fullYear, month - 1, day);
};

export const shuffleIteamArray = (teamList: ITeam[]): ITeam[] => {
  const newTeamList = [...teamList];

  for (let i = newTeamList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newTeamList[i], newTeamList[j]] = [newTeamList[j], newTeamList[i]];
  }

  return newTeamList;
};

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
  });

  const teamStatistics = Object.values(teams);

  teamStatistics.sort((a, b) => b.points - a.points);

  teamStatistics.forEach((team, index) => {
    team.position = index + 1;
  });

  return teamStatistics;
};

export const generateRandomGoalForIdplayers = (players: IUser[], minId: number, maxId: number): IUser[] => {
  const goalIds: IUser[] = [];
  const numGoals = Math.floor(Math.random() * 4);

  for (let i = 0; i < numGoals; i++) {
    const playerId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    goalIds.push(players[playerId].id);
  }

  return goalIds;
};

export const generateLeagueFunction = async (startDate: Date): Promise<any> => {
  try {
    const teamsSended = await teamOdm.getAllTeams();
    const teams = leagueDto.shuffleIteamArray(teamsSended);

    if (teams.length === 0) {
      console.error("No hay equipos en la BBDD.");
      return;
    }
    if (teams.length % 2 !== 0) {
      console.error("La cantidad de equipos es impar.");
      return;
    }

    await matchOdm.deleteAllMatch();
    console.log("Partidos borrados");

    const matches: IMatchCreate[] = [];
    const numTeams = teams.length;

    if (numTeams % 2 !== 0) {
      console.error("La cantidad de equipos debe ser par para aplicar el algoritmo de doble vuelta.");
      return;
    }

    const numRounds = (numTeams - 1) * 2;

    for (let round = 1; round <= numRounds / 2; round++) {
      const roundMatches: IMatchCreate[] = [];

      for (let i = 0; i < numTeams / 2; i++) {
        const home = (i + round) % numTeams;
        let away = (numTeams - 1 - i + round) % numTeams;

        // Ajustar el índice 'away' si es igual al índice 'home'
        if (away === home) {
          away = (away + 1) % numTeams;
        }

        const localTeam = teams[home];
        const visitorTeam = teams[away];

        const matchDate: Date = new Date(startDate.getTime() + round * 7 * 24 * 60 * 60 * 1000);
        const actualDate = new Date();

        const match: IMatchCreate = {
          date: matchDate,
          localTeam,
          visitorTeam,
          played: matchDate < actualDate,
          round,
        };

        roundMatches.push(match);
      }

      matches.push(...roundMatches);
    }

    // Generar segunda vuelta
    for (let round = 1; round <= numRounds / 2; round++) {
      const roundMatches: IMatchCreate[] = [];

      for (let i = 0; i < numTeams / 2; i++) {
        const home = (i + round) % numTeams;
        const away = (numTeams - 1 - i + round) % numTeams;

        const localTeam = teams[away]; // Intercambiar home y away para la segunda vuelta
        const visitorTeam = teams[home];

        const matchDate: Date = new Date(startDate.getTime() + (round + numRounds / 2) * 7 * 24 * 60 * 60 * 1000);
        const actualDate = new Date();

        const match: IMatchCreate = {
          date: matchDate,
          localTeam,
          visitorTeam,
          played: matchDate < actualDate,
          round: round + numRounds / 2, // Ajustar el número de la jornada para la segunda vuelta
        };

        roundMatches.push(match);
      }

      matches.push(...roundMatches);
    }

    await matchOdm.createMatchsFromArray(matches);

    const matchSort = matches.sort((a, b) => a.round - b.round);

    for (let i = 0; i < matchSort.length; i++) {
      const match = matches[i];
      const formattedDate = match.date.toLocaleDateString();
      const status = match.played ? "Jugado" : "Pendiente";
      console.log(`Jornada ${match.round} Partido: ${match.localTeam.name} / ${match.visitorTeam.name} Fecha ${formattedDate} - ${status}`);
    }
    console.log("Partidos generados correctamente");
    console.log({
      matchesNum: matches.length,
      numRounds,
      matchesPerRound: numTeams / 2,
    });
    console.log("Liga generada correctamente");

    return matches;
  } catch (error) {
    console.error(error);
  }
};

export const leagueDto = {
  validateAndParsedStartDate,
  convertDateStringToDate,
  shuffleIteamArray,
  calculateTeamStatisticsFunction,
  generateRandomGoalForIdplayers,
  generateLeagueFunction,
};
