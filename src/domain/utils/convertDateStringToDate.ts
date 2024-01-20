export const convertDateStringToDate = (dateString: string): Date => {
  const [day, month, year] = dateString.split("/").map(Number);
  const fullYear = year < 100 ? year + 2000 : year;
  return new Date(fullYear, month - 1, day);
}
