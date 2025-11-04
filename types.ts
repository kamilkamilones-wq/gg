export type Gender = 'female' | 'male' | 'unisex';
export type BodyType = 'szczupła' | 'atletyczna' | 'pełniejsza' | 'standardowa';
export type Scene = 'studio' | 'ulica' | 'wnętrze' | 'park';

export interface UserData {
  gender: Gender;
  height: string;
  weight: string;
  bodyType: BodyType;
  size: string;
  scene: Scene;
}

export interface GarmentPiece {
  id: string;
  description: string;
  frontImage: File | null;
  backImage: File | null;
  detailImages: (File | null)[];
}

export interface FitAnalysis {
  ramiona: string;
  talia: string;
  długość_rękawa: string;
  długość_całkowita: string;
  ogólne_dopasowanie: string;
}

export type Angle = 'Przód' | 'Prawy Profil' | 'Tył' | 'Lewy Profil';

export interface ModelView {
  angle: Angle;
  url: string;
}

export interface GenerationResult {
  views: ModelView[];
  fitAnalysis: FitAnalysis | null;
}
