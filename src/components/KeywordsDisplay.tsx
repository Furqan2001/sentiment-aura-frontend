import { useEffect, useState } from "react";

interface KeywordsDisplayProps {
  keywords: string[];
}

export const KeywordsDisplay: React.FC<KeywordsDisplayProps> = ({
  keywords,
}) => {
  const [visibleKeywords, setVisibleKeywords] = useState<string[]>([]);

  useEffect(() => {
    setVisibleKeywords([]);
    const timers: number[] = [];
    keywords.forEach((keyword, index) => {
      const id = window.setTimeout(() => {
        setVisibleKeywords((prev: string[]) => [...prev, keyword]);
      }, index * 150);
      timers.push(id);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [keywords]);

  if (keywords.length === 0) return null;

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500/8 via-slate-500/8 to-indigo-500/8 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl px-6 py-4">
        <div className="text-white/50 text-xs uppercase tracking-widest font-light mb-3 text-center">
          Key Topics
        </div>

        <div className="flex flex-wrap gap-2 justify-center max-w-md">
          {visibleKeywords.map((keyword, index) => (
            <div
              key={index}
              className="px-4 py-1.5 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 backdrop-blur-sm rounded-full border border-white/25 text-white text-sm font-medium shadow-lg"
              style={{
                animation: `fadeInScale 0.5s ease-out ${index * 0.1}s both`,
              }}
            >
              {keyword}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
