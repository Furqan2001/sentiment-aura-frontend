interface SentimentIndicatorProps {
  sentiment: number;
}
export const SentimentIndicator: React.FC<SentimentIndicatorProps> = ({
  sentiment,
}) => {
  const getSentimentText = (s: number): string => {
    if (s > 0.5) return "Very Positive";
    if (s > 0.2) return "Positive";
    if (s > -0.2) return "Neutral";
    if (s > -0.5) return "Negative";
    return "Very Negative";
  };

  const getSentimentColor = (s: number): string => {
    if (s > 0.5) return "from-green-400 to-emerald-500";
    if (s > 0.2) return "from-lime-400 to-green-500";
    if (s > -0.2) return "from-blue-400 to-cyan-500";
    if (s > -0.5) return "from-purple-400 to-blue-500";
    return "from-red-400 to-purple-500";
  };

  return (
    <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-full px-6 py-3 border border-white border-opacity-20">
      <div className="flex items-center gap-3">
        <div
          className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSentimentColor(
            sentiment
          )} animate-pulse`}
        />
        <span className="text-white text-sm font-medium">
          {getSentimentText(sentiment)}
        </span>
      </div>
    </div>
  );
};
