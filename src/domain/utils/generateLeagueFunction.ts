import { IMatchCreate } from "../entities/match-entity";
import { Team } from "../entities/team-entity";
import { matchOdm } from "../odm/match.odm";
import { shuffleIteamArray } from "./shuffleIteamArray";

export const generateLeagueFunction = async (startDate: Date): Promise<any> => {
  try {
    const actualDate: Date = new Date();
    if (actualDate > startDate) {
      console.error("La fecha tiene que ser posterior a la actual");
      return;
    }

    const teamsSended = await Team.find();
    const teams = shuffleIteamArray(teamsSended);

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
