import { IMatchCreate } from "../../entities/match-entity";
import { ITeam } from "../../entities/team-entity";

import { userOdm } from "../../odm/user.odm";
import { teamOdm } from "../../odm/team.odm";
import { matchOdm } from "../../odm/match.odm";

import { leagueDto } from "../../dto/league.dto";
import { generateRandomGoalForIdplayers } from "./generateRandomData";

export const generateLeagueWithData = async (startDate: Date): Promise<IMatchCreate[]> => {
  const matchesInLeague: IMatchCreate[] = [];

  const teamsInDataBase = await teamOdm.getAllTeams();
  const checkedTeams = leagueDto.checkTeamsNumberIsCorrectPerCreateLeagueAndShuffleIteamArray(teamsInDataBase);

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

      const matchLeague = await generateMatchWithData(checkedTeams, home, away, startDate, actualRound);

      matchesInLeague.push(matchLeague);
    }
  }

  // Generar segunda vuelta
  for (let round = 1; round <= numerRoundsPerLap; round++) {
    for (let i = 0; i < numberMatchesPerRound; i++) {
      const home = (numTeams - 1 - i + round) % numTeams;
      const away = (i + round) % numTeams;

      const actualRound = round + numerRoundsPerLap;

      const matchLeague = await generateMatchWithData(checkedTeams, home, away, startDate, actualRound);

      matchesInLeague.push(matchLeague);
    }
  }

  await matchOdm.deleteAllMatch();

  await matchOdm.createMatchsFromArray(matchesInLeague);

  matchesInLeague.sort((a, b) => a.round - b.round);

  leagueDto.showDataLeague(matchesInLeague, numTeams, numRounds);

  return matchesInLeague;
};

export const generateMatchWithData = async (teams: ITeam[], home: number, away: number, startDate: Date, actualRound: number): Promise<IMatchCreate> => {
  const localTeam = teams[home];
  const visitorTeam = teams[away];

  const localPlayers = await userOdm.getPlayersByIdTeam(localTeam.id);
  const visitorPlayers = await userOdm.getPlayersByIdTeam(visitorTeam.id);

  const goalsLocal = generateRandomGoalForIdplayers(localPlayers, 0, 3);
  const goalsVisitor = generateRandomGoalForIdplayers(visitorPlayers, 0, 3);

  const matchDate = new Date(startDate.getTime() + actualRound * 7 * 24 * 60 * 60 * 1000);
  const actualDate = new Date();
  const played = matchDate < actualDate;

  const match: IMatchCreate = {
    date: matchDate,
    localTeam,
    visitorTeam,
    goalsLocal,
    goalsVisitor,
    played,
    round: actualRound,
  };

  return match;
};
