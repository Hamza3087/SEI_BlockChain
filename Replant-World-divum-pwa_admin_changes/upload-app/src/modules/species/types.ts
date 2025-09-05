export type Species = {
  botanical_name: string;
  common_name: string;
  is_native: boolean;
};

export type AssignedSpecies = {
  id: number;
  species: Species;
};
