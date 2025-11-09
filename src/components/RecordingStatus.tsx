import { Circle } from "lucide-react";

interface RecordingStatusProps {
  isRecording: boolean;
  isProcessing: boolean;
}

export const RecordingStatus: React.FC<RecordingStatusProps> = ({
  isRecording,
  isProcessing,
}) => {
  const getStatus = () => {
    if (isProcessing) {
      return {
        text: "Processing...",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/20",
        borderColor: "border-emerald-500/30",
        icon: "👂",
        showCircle: true,
        circleColor: "text-emerald-500",
      };
    }
    if (!isRecording) {
      return {
        text: "Ready to record",
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
        icon: "⏸️",
        showCircle: false,
      };
    }
    return {
      text: "Recording",
      color: "text-red-400",
      bgColor: "bg-red-500/20",
      borderColor: "border-red-500/30",
      icon: "🎙️",
      showCircle: true,
      circleColor: "text-red-500",
    };
  };

  const status = getStatus();

  return (
    <>
      <div
        className={`flex items-center gap-3 px-4 py-2.5 ${status.bgColor} backdrop-blur-md rounded-full border ${status.borderColor} shadow-lg transition-all duration-300`}
      >
        {status.showCircle ? (
          <Circle
            className={`${status.circleColor} animate-pulse`}
            size={10}
            fill="currentColor"
          />
        ) : (
          <span className="text-lg">{status.icon}</span>
        )}
        <span className={`${status.color} text-sm font-medium`}>
          {status.text}
        </span>
      </div>
    </>
  );
};
