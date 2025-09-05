import { Species } from 'modules/species';

export type NewTree = {
  assigned_species_id: number;
  captured_at: string;
  image: string; // as data URL
  latitude: string;
  longitude: string;
};

export type CapturedImage = Omit<NewTree, 'assigned_species_id'>;

export type ReviewState = 'PENDING' | 'APPROVED' | 'REJECTED';

export type Plant = {
  id: number;
  species: Species;
  review_state: ReviewState;
  image: string;
  latitude: string;
  longitude: string;
  created_at: string;
  rejection_reason?: string;
};

export type PlantsSummary = {
  added_count: number;
  pending_review_count: number;
  approved_count: number;
  rejected_count: number;
};

export type Page<T> = {
  count: number;
  next: string;
  previous: string;
  results: T[];
};
