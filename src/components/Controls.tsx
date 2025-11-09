import { Mic, MicOff } from "lucide-react";

interface ControlsProps {
  isRecording: boolean;
  onToggleRecording: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRecording,
  onToggleRecording,
}) => {
  return (
    <button
      onClick={onToggleRecording}
      className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 backdrop-blur-sm border ${
        isRecording
          ? "bg-red-500/80 hover:bg-red-600/80 border-red-400/30 text-white"
          : "bg-gradient-to-r from-slate-500/40 to-blue-500/40 hover:from-slate-600/70 hover:to-blue-600/70 border-white/20 text-white"
      }`}
    >
      {isRecording ? (
        <>
          <MicOff size={20} />
          <span>Stop Recording</span>
        </>
      ) : (
        <>
          <Mic size={20} />
          <span>Start Recording</span>
        </>
      )}
    </button>
  );
};
