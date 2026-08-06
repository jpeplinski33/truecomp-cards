export type PriceMode = "one_thirty_point" | "golden" | "blend";

export type CardInstance = {
  id: string;
  catalogName: string;
  setName: string;
  year?: number;
  category: "sports" | "pokemon" | "other";
  sport?: string;
  condition: string;
  grade?: string;
  grader?: string;
  quantity: number;
  valueCents: number;
  sourceMode: PriceMode;
  valueBreakdown?: {
    oneThirtyPointCents?: number;
    goldenCents?: number;
  };
  addedAt: string;
  imageHint?: string;
};

export type Collection = {
  id: string;
  name: string;
  createdAt: string;
  cards: CardInstance[];
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  password: string; // demo only — never do this in production
  priceMode: PriceMode;
  blendWeights: { one_thirty_point: number; golden: number };
  collections: Collection[];
  createdAt: string;
};

export type Session = {
  userId: string;
  email: string;
  displayName: string;
};
