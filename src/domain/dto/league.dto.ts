import { CustomError } from "../../server/checkError.middleware";

import { IMatchCreate } from "../entities/match-entity";
import { ITeam } from "../entities/team-entity";

import { convertDateStringToDate } from "../../utils/convertDateStringToDate";

const checkAreTeamsCorrectToCreateLeague = (teams: ITeam[]): void => {
  if (!teams || teams.length === 0) {
    throw new CustomError("No hay equipos en la BBDD.", 400);
  }

  if (teams.length % 2 !== 0) {
    throw new CustomError("La cantidad de equipos debe ser par para aplicar el algoritmo de doble vuelta.", 400);
  }
};

const checkParsedStartDateForCreateLeague = (startDateString: string): Date => {
  const actualDate: Date = new Date();

  if (!startDateString) {
    throw new CustomError("Tiene que introducir una fecha de inicio con formato:'21/5/4' para realizar esta operación", 404);
  }

  const startDate = convertDateStringToDate(startDateString);

  if (actualDate > startDate) {
    throw new CustomError("La fecha tiene que ser posterior a la actual", 404);
  }

  return startDate;
};

const checkAreTeamsNumberCorrectPerCreateLeagueAndShuffleIteamArray = (teamList: ITeam[]): ITeam[] => {
  const newTeamList = [...teamList];

  checkAreTeamsCorrectToCreateLeague(newTeamList);

  for (let i = newTeamList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newTeamList[i], newTeamList[j]] = [newTeamList[j], newTeamList[i]];
  }

  return newTeamList;
};

const showDataLeague = (matches: IMatchCreate[], numCheckedTeams: number, numRounds: number): void => {
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
    matchesPerRound: ${numCheckedTeams / 2},
  }

  ------------------------------

  Liga generada correctamente

  ------------------------------
  
  `);
};

const generateMatchesPerLeague = (checkedTeams: ITeam[], startDate: Date): IMatchCreate[] => {
  const matchesInLeague: IMatchCreate[] = [];

  const matchesInFirstLap = leagueDto.generateMatchesPerLap(checkedTeams, startDate, true);

  for (const match of matchesInFirstLap) {
    matchesInLeague.push(match);
  }

  const matchesInSecondLap = leagueDto.generateMatchesPerLap(checkedTeams, startDate, false);

  for (const match of matchesInSecondLap) {
    matchesInLeague.push(match);
  }
  return matchesInLeague;
};

const generateMatchesPerLap = (checkedTeams: ITeam[], startDate: Date, reverse: boolean): IMatchCreate[] => {
  const matchesInLap: IMatchCreate[] = [];

  const numCheckedTeams = checkedTeams.length;
  const numTotalRoundsInLeague = (numCheckedTeams - 1) * 2;
  const numerRoundsPerLap = numTotalRoundsInLeague / 2;

  for (let round = 1; round <= numerRoundsPerLap; round++) {
    const roundMatchesPerRound = leagueDto.generateMatchesPerRound(checkedTeams, numCheckedTeams, startDate, round, reverse);

    for (const match of roundMatchesPerRound) {
      matchesInLap.push(match);
    }
  }

  return matchesInLap;
};

const generateMatchesPerRound = (checkedTeams: ITeam[], numCheckedTeams: number, startDate: Date, round: number, reverse: boolean): IMatchCreate[] => {
  const matchesPerRound = [];

  const numRounds = (numCheckedTeams - 1) * 2;
  const numerRoundsPerLap = numRounds / 2;
  const numberMatchesPerRound = numCheckedTeams / 2;

  for (let i = 0; i < numberMatchesPerRound; i++) {
    const home = reverse ? (numCheckedTeams - 1 - i + round) % numCheckedTeams : (i + round) % numCheckedTeams;
    const away = reverse ? (i + round) % numCheckedTeams : (numCheckedTeams - 1 - i + round) % numCheckedTeams;

    const actualRound = reverse ? round + numerRoundsPerLap : round;

    const matchLeague = leagueDto.generateMatch(checkedTeams, home, away, startDate, actualRound);
    matchesPerRound.push(matchLeague);
  }

  return matchesPerRound;
};

const generateMatch = (teams: ITeam[], home: number, away: number, startDate: Date, actualRound: number): IMatchCreate => {
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
  checkParsedStartDateForCreateLeague,
  checkAreTeamsCorrectToCreateLeague,
  checkAreTeamsNumberCorrectPerCreateLeagueAndShuffleIteamArray,
  generateMatch,
  generateMatchesPerRound,
  generateMatchesPerLap,
  generateMatchesPerLeague,
};
