export interface ITeamsStatistics {
  id: string;
  name: string;
  initials: string;
  image?: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  position: number;
}
