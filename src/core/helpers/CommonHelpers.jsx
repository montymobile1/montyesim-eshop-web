export const normalizeString = (str) => {
  return str
    ?.normalize("NFD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
