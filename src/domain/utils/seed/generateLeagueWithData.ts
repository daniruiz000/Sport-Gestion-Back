import { IMatchCreate } from "../../entities/match-entity";
import { Team } from "../../entities/team-entity";
import { ROL, User } from "../../entities/user-entity";
import { matchOdm } from "../../odm/match.odm";
import { leagueDto } from "../../dto/league.dto";

export const generateLeagueWithData = async (): Promise<void> => {
  try {
    const teamsSended = await Team.find();
    const teams = leagueDto.shuffleIteamArray(teamsSended);

    if (teams.length === 0) {
      console.error("No hay equipos en la BBDD.");
      return;
    }

    if (teams.length % 2 !== 0) {
      console.error("La cantidad de equipos es impar.");
      return;
    }

    const players = await User.find({ rol: ROL.PLAYER, team: { $in: teams.map((team) => team.id) } });
    if (players.length === 0) {
      console.error("No hay jugadores en la BBDD.");
      return;
    }

    await matchOdm.deleteAllMatch();
    console.log("Partidos borrados");

    const matches: IMatchCreate[] = [];
    const numTeams = teams.length;
    const numRoundsPerFase = numTeams - 1;
    const actualDate = new Date();
    const startDate = leagueDto.convertDateStringToDate("22/5/22");
    let contDate = startDate;

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

        const localTeam = teams[home];
        const visitorTeam = teams[away];

        const localPlayers = await User.find({ team: localTeam.id }).populate("team");
        const visitorPlayers = await User.find({ team: visitorTeam.id }).populate("team");

        const matchDate: Date = new Date(startDate.getTime() + round * 7 * 24 * 60 * 60 * 1000);

        const localGoals = leagueDto.generateRandomGoalForIdplayers(localPlayers, 0, 3);
        const visitorGoals = leagueDto.generateRandomGoalForIdplayers(visitorPlayers, 0, 3);

        const match: IMatchCreate = {
          date: matchDate,
          localTeam,
          visitorTeam,
          goalsLocal: localGoals,
          goalsVisitor: visitorGoals,
          played: matchDate < actualDate,
          round: round + 1, // Se incrementa en 1 para indicar la ronda actual
        };
        contDate = matchDate;
        roundMatches.push(match);
      }

      matches.push(...roundMatches);
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

        const localTeam = teams[home];
        const visitorTeam = teams[away];

        const localPlayers = await User.find({ team: localTeam.id }).populate("team");
        const visitorPlayers = await User.find({ team: visitorTeam.id }).populate("team");

        const matchDate: Date = new Date(contDate.getTime() + (round + numRoundsPerFase) * 7 * 24 * 60 * 60 * 1000);

        const localGoals = leagueDto.generateRandomGoalForIdplayers(localPlayers, 0, 3);
        const visitorGoals = leagueDto.generateRandomGoalForIdplayers(visitorPlayers, 0, 3);

        const match: IMatchCreate = {
          date: matchDate,
          localTeam,
          visitorTeam,
          goalsLocal: localGoals,
          goalsVisitor: visitorGoals,
          played: matchDate < actualDate,
          round: round + numRoundsPerFase + 1, // Se incrementa en 1 para indicar la ronda actual
        };

        roundMatches.push(match);
      }

      matches.push(...roundMatches);
    }

    // Guardar los partidos en la base de datos.
    await matchOdm.createMatchsFromArray(matches);
    const matchSort = matches.sort((a, b) => a.round - b.round);
    for (let i = 0; i < matchSort.length; i++) {
      const match = matches[i];
      const formattedDate = match.date.toLocaleDateString();
      const status = match.played ? "Jugado" : "Pendiente";
      console.log(`Jornada ${match.round} Partido: ${match.localTeam.name} | ${match.goalsLocal?.length ? match.goalsLocal?.length : 0} - ${match.goalsVisitor?.length ? match.goalsVisitor?.length : 0} | ${match.visitorTeam.name} Fecha ${formattedDate} - ${status}`);
    }
    console.log("Partidos generados correctamente");
    console.log({
      matchesNum: matches.length,
      numRounds: numRoundsPerFase * 2,
      matchesPerRound: numTeams / 2,
    });
    console.log("Liga generada correctamente");
  } catch (error) {
    console.error(error);
  }
};
