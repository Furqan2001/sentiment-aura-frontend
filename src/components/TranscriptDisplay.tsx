import { useEffect, useRef } from "react";

interface TranscriptDisplayProps {
  transcript: string;
}

export const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({
  transcript,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  if (!transcript.trim()) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl px-8 pointer-events-auto">
      <div className="bg-gradient-to-br from-slate-500/8 via-blue-500/8 to-indigo-500/8 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden pointer-events-auto">
        <div
          ref={scrollRef}
          className="px-6 py-5 max-h-72 overflow-y-auto custom-scrollbar pointer-events-auto"
        >
          <p className="text-white text-xl leading-relaxed text-center">
            {transcript}
          </p>
        </div>
      </div>
    </div>
  );
};
