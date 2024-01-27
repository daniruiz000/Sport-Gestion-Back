import { ROL } from "./domain/entities/user-entity";

export const teamList = [
  { name: "Real Madrid CF", initials: "RMC", image: "https://assets.laliga.com/assets/2019/06/07/small/real-madrid.png" },
  { name: "Barcelona FC", initials: "FBC", image: "https://assets.laliga.com/assets/2019/06/07/small/barcelona.png" },
  { name: "Cadiz FC", initials: "CDF", image: "https://assets.laliga.com/assets/2019/06/07/small/cadiz.png" },
  { name: "Real Betis", initials: "RBC", image: "https://assets.laliga.com/assets/2022/09/15/small/e4a09419d3bd115b8f3dab73d480e146.png" },
  { name: "Sevilla FC", initials: "SFC", image: "https://assets.laliga.com/assets/2019/06/07/small/sevilla.png" },
  { name: "Valencia CF", initials: "VCF", image: "https://assets.laliga.com/assets/2019/06/07/small/valencia.png" },
  { name: "Real Sociedad", initials: "RSC", image: "https://assets.laliga.com/assets/2019/06/07/small/real-sociedad.png" },
  { name: "Atlético de Madrid", initials: "ATM", image: "https://assets.laliga.com/assets/2019/06/07/small/atletico.png" },
  { name: "Girona FC", initials: "GFC", image: "https://assets.laliga.com/assets/2019/06/07/small/girona.png" },
  { name: "Getafe FC", initials: "GEC", image: "https://assets.laliga.com/assets/2019/06/07/small/getafe.png" },
];

export const adminUser = {
  firstName: "Dani",
  lastName: "Ruiz",
  email: "admin@gmail.com",
  password: "55555555",
  rol: ROL.ADMIN,
};
