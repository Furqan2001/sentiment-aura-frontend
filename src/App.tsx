import { TranscriptDisplay } from "./components/TranscriptDisplay";
import { KeywordsDisplay } from "./components/KeywordsDisplay";
import { Controls } from "./components/Controls";
import { SentimentIndicator } from "./components/SentimentIndicator";
import { PerlinNoiseVisualization } from "./components/PerlinNoiseVisualization";
import { RecordingStatus } from "./components/RecordingStatus";

import { useSentimentAura } from "./hooks/useSentimentAura";

const SentimentAuraApp: React.FC = () => {
  const {
    transcript,
    sentiment,
    keywords,
    isRecording,
    isProcessing,
    error,
    toggleRecording,
  } = useSentimentAura();

  return (
    <div className="w-full h-screen overflow-hidden relative">
      <PerlinNoiseVisualization sentiment={sentiment} />

      <div className="fixed mx-auto px-6 flex items-start justify-between top-6 left-0 right-0 z-10">
        <RecordingStatus
          isRecording={isRecording}
          isProcessing={isProcessing}
        />
        <KeywordsDisplay keywords={keywords} />
      </div>

      <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
        {error ? (
          <div className="bg-gradient-to-br from-red-500/50 via-rose-500/50 to-red-600/50 backdrop-blur-xl border border-red-400/30 text-white px-6 py-4 rounded-2xl max-w-md text-center z-50 shadow-2xl">
            {error}
          </div>
        ) : (
          <TranscriptDisplay transcript={transcript} />
        )}
      </div>

      <div className="fixed bottom-8 flex flex-col gap-y-4 left-1/2 transform -translate-x-1/2">
        <SentimentIndicator sentiment={sentiment} />
        <Controls
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
        />
      </div>
    </div>
  );
};

export default SentimentAuraApp;
