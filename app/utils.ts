export const codeToHumanString = (input: string): string => {
  const words = input.toLowerCase().split("_");
  const capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1),
  );

  return capitalizedWords.join(" ");
};

export const EXPECTED_CHAIN_ID = 80002;
