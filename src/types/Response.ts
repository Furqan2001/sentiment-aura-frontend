export type DeepgramResponse = {
  channel?: {
    alternatives?: Array<{
      transcript: string;
    }>;
  };
  is_final?: boolean;
};

export type SentimentResponse = {
  sentiment: number;
  keywords: string[];
};
