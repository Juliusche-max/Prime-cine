export type ContentType = "movie" | "series" | "documentary" | "reality";

export type Genre =
  | "Action"
  | "Comédie"
  | "Drame"
  | "Romance"
  | "Documentaire"
  | "Télé-réalité"
  | "Thriller"
  | "Famille";

export interface CastMember {
  id: string;
  name: string;
  role: string;
  photoUrl: string;
}

export interface Episode {
  id: string;
  episodeNumber: number;
  seasonNumber: number;
  title: string;
  synopsis: string;
  duration: string;
  thumbnailUrl: string;
  videoUrl?: string;
  releaseDate: string;
}

export interface Comment {
  id: string;
  userName: string;
  avatarUrl: string;
  content: string;
  rating: number;
  createdAt: string;
}

export interface Title {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  type: ContentType;
  isOriginal: boolean;
  synopsis: string;
  shortSynopsis: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  videoUrl?: string;
  rating: number; // out of 10
  ageRating: string; // e.g. "13+"
  duration: string; // "1h 52min" or "3 saisons"
  releaseYear: number;
  releaseDate: string;
  genres: Genre[];
  director: string;
  cast: CastMember[];
  language: string;
  country: string;
  progress?: number; // 0-100 for continue watching
  episodes?: Episode[];
  comments?: Comment[];
}

export interface Row {
  id: string;
  title: string;
  titles: Title[];
}
