import { CustomError } from "../../server/checkError.middleware";
import { IMatchCreate } from "../entities/match-entity";
import { ITeam, ITeamsStatistics } from "../entities/team-entity";
import { IUser } from "../entities/user-entity";
import { matchOdm } from "../odm/match.odm";
import { teamOdm } from "../odm/team.odm";

const generateRandomGoalForIdplayers = (players: IUser[], minId: number, maxId: number): IUser[] => {
  const goalIds: IUser[] = [];
  const numGoals = Math.floor(Math.random() * 4);

  for (let i = 0; i < numGoals; i++) {
    const playerId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    goalIds.push(players[playerId].id);
  }

  return goalIds;
};

export const checkAreTeamsCorrectToCreateLeague = (teams: ITeam[]): void => {
  if (!teams || teams.length === 0) {
    throw new CustomError("No hay equipos en la BBDD.", 400);
  }

  if (teams.length % 2 !== 0) {
    throw new CustomError("La cantidad de equipos debe ser par para aplicar el algoritmo de doble vuelta.", 400);
  }
};

const showDataLeague = (matches: IMatchCreate[], numTeams: number, numRounds: number): void => {
  for (const match of matches) {
    const formattedDate = match.date.toLocaleDateString();
    const status = match.played ? "Jugado" : "Pendiente";
    console.log(`Jornada ${match.round} Partido: ${match.localTeam.name} | ${match.goalsLocal?.length ? match.goalsLocal?.length : 0} - ${match.goalsVisitor?.length ? match.goalsVisitor?.length : 0} | ${match.visitorTeam.name} Fecha ${formattedDate} - ${status}`);
  }

  console.log(`
  ------------------------------

  Partidos generados correctamente

  {
    matchesNum: ${matches.length},
    numRounds: ${numRounds},
    matchesPerRound: ${numTeams / 2},
  }

  ------------------------------

  Liga generada correctamente

  ------------------------------
  
  `);
};

const validateAndParsedStartDateForCreateLeague = (startDateString: string): Date => {
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

const convertDateStringToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/").map(Number);
  const fullYear = year < 100 ? year + 2000 : year;

  return new Date(fullYear, month - 1, day);
};

const checkTeamsNumberIsCorrectAndShuffleIteamArray = (teamList: ITeam[]): ITeam[] => {
  const newTeamList = [...teamList];

  checkAreTeamsCorrectToCreateLeague(newTeamList);

  for (let i = newTeamList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newTeamList[i], newTeamList[j]] = [newTeamList[j], newTeamList[i]];
  }

  return newTeamList;
};

const calculateTeamStatisticsFunction = async (matches: IMatchCreate[]): Promise<ITeamsStatistics[]> => {
  const teams: Record<string, ITeamsStatistics> = {};

  for (const match of matches) {
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
  }

  const teamStatistics = Object.values(teams);

  teamStatistics.sort((a, b) => b.points - a.points);

  teamStatistics.forEach((team, index) => {
    team.position = index + 1;
  });

  return teamStatistics;
};

const generateLeagueFunction = async (startDate: Date): Promise<IMatchCreate[]> => {
  const matchesInLeague: IMatchCreate[] = [];

  const teamsInDataBase = await teamOdm.getAllTeams();
  const checkedTeams = leagueDto.checkTeamsNumberIsCorrectAndShuffleIteamArray(teamsInDataBase);

  const numTeams = checkedTeams.length;
  const numRounds = (numTeams - 1) * 2;
  const numerRoundsPerLap = numRounds / 2;
  const numberMatchesPerRound = numTeams / 2;

  // Generar primera vuelta
  for (let round = 1; round <= numerRoundsPerLap; round++) {
    for (let i = 0; i < numberMatchesPerRound; i++) {
      const home = (i + round) % numTeams;
      const away = (numTeams - 1 - i + round) % numTeams;

      const actualRound = round;

      const matchLeague = leagueDto.generateMatchLeague(checkedTeams, home, away, startDate, actualRound);

      matchesInLeague.push(matchLeague);
    }
  }

  // Generar segunda vuelta
  for (let round = 1; round <= numerRoundsPerLap; round++) {
    for (let i = 0; i < numberMatchesPerRound; i++) {
      const home = (numTeams - 1 - i + round) % numTeams;
      const away = (i + round) % numTeams;

      const actualRound = round + numerRoundsPerLap;

      const matchLeague = leagueDto.generateMatchLeague(checkedTeams, home, away, startDate, actualRound);

      matchesInLeague.push(matchLeague);
    }
  }

  await matchOdm.deleteAllMatch();
  await matchOdm.createMatchsFromArray(matchesInLeague);

  matchesInLeague.sort((a, b) => a.round - b.round);

  leagueDto.showDataLeague(matchesInLeague, numTeams, numRounds);

  return matchesInLeague;
};

const generateMatchLeague = (teams: ITeam[], home: number, away: number, startDate: Date, actualRound: number): IMatchCreate => {
  const localTeam = teams[home];
  const visitorTeam = teams[away];

  const matchDate = new Date(startDate.getTime() + actualRound * 7 * 24 * 60 * 60 * 1000);
  const actualDate = new Date();
  const played = matchDate < actualDate;

  const match: IMatchCreate = {
    date: matchDate,
    localTeam,
    visitorTeam,
    played,
    round: actualRound,
  };

  return match;
};

export const leagueDto = {
  showDataLeague,
  validateAndParsedStartDateForCreateLeague,
  convertDateStringToDate,
  checkTeamsNumberIsCorrectAndShuffleIteamArray,
  calculateTeamStatisticsFunction,
  generateRandomGoalForIdplayers,
  generateLeagueFunction,
  generateMatchLeague,
};
