import { CustomError } from "../../server/checkError.middleware";
import { IMatchCreate } from "../entities/match-entity";
import { ITeam, ITeamsStatistics } from "../entities/team-entity";
import { IUser } from "../entities/user-entity";

const generateRandomGoalForIdplayers = (players: IUser[], minId: number, maxId: number): IUser[] => {
  const goalIds: IUser[] = [];
  const numGoals = Math.floor(Math.random() * 4);

  for (let i = 0; i < numGoals; i++) {
    const playerId = Math.floor(Math.random() * (maxId - minId + 1)) + minId;
    goalIds.push(players[playerId].id);
  }

  return goalIds;
};

const convertDateStringToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/").map(Number);
  const fullYear = year < 100 ? year + 2000 : year;

  return new Date(fullYear, month - 1, day);
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

const checkAreTeamsCorrectToCreateLeague = (teams: ITeam[]): void => {
  if (!teams || teams.length === 0) {
    throw new CustomError("No hay equipos en la BBDD.", 400);
  }

  if (teams.length % 2 !== 0) {
    throw new CustomError("La cantidad de equipos debe ser par para aplicar el algoritmo de doble vuelta.", 400);
  }
};

const checkTeamsNumberIsCorrectPerCreateLeagueAndShuffleIteamArray = (teamList: ITeam[]): ITeam[] => {
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

const calculateLeagueStatisticsPerTeam = async (matches: IMatchCreate[]): Promise<ITeamsStatistics[]> => {
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

const generateMatchesPerLeague = async (checkedTeams: ITeam[], startDate: Date): Promise<IMatchCreate[]> => {
  const matchesInLeague: IMatchCreate[] = [];

  const matchesInFirstLap = await leagueDto.generateMatchesPerLap(checkedTeams, startDate, true);

  for (const match of matchesInFirstLap) {
    matchesInLeague.push(match);
  }

  const matchesInSecondLap = await leagueDto.generateMatchesPerLap(checkedTeams, startDate, false);

  for (const match of matchesInSecondLap) {
    matchesInLeague.push(match);
  }
  return matchesInLeague;
};

const generateMatchesPerLap = async (checkedTeams: ITeam[], startDate: Date, reverse: boolean): Promise<IMatchCreate[]> => {
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
  validateAndParsedStartDateForCreateLeague,
  convertDateStringToDate,
  checkAreTeamsCorrectToCreateLeague,
  checkTeamsNumberIsCorrectPerCreateLeagueAndShuffleIteamArray,
  calculateLeagueStatisticsPerTeam,
  generateRandomGoalForIdplayers,
  generateMatch,
  generateMatchesPerRound,
  generateMatchesPerLap,
  generateMatchesPerLeague,
};
