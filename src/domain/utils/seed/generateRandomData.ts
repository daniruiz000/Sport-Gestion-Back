import { faker } from "@faker-js/faker";

import { IUser, IUserCreate, ROL } from "../../entities/user-entity";

export const generateRandomGoalForIdplayers = (players: IUser[], minGoals: number, maxGoals: number): IUser[] => {
  const goalIds: IUser[] = [];
  const numGoals = Math.floor(Math.random() * 4);

  for (let i = 0; i < numGoals; i++) {
    const playerId = Math.floor(Math.random() * (maxGoals - minGoals + 1)) + minGoals;
    goalIds.push(players[playerId].id);
  }

  return goalIds;
};

export const createRandomUserArray = (rol: ROL, numRandomUsers: number): IUserCreate[] => {
  const randomUserArray = [];

  for (let i = 0; i < numRandomUsers; i++) {
    const randomUser = createRandomUser(rol);
    randomUserArray.push(randomUser);
  }

  return randomUserArray;
};

export const createRandomUser = (rol: ROL): IUserCreate => {
  const randomUser = {
    firstName: faker.person.firstName("male"),
    lastName: faker.person.lastName("male"),
    email: faker.internet.email(),
    image: `https://randomuser.me/api/portraits/men/${getRandomIntInclusive(10, 99)}.jpg`,
    password: faker.internet.password(),
    rol,
  };

  return randomUser;
};

export const getRandomIntInclusive = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
};
