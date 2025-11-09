import { useCallback, useEffect, useRef, useState } from "react";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import type { LiveClient } from "@deepgram/sdk";
import type { SentimentResponse } from "../types/Response";
import { API_BASE_URL } from "../constants/api";

export const useSentimentAura = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [sentiment, setSentiment] = useState<number>(0);
  const [keywords, setKeywords] = useState<string[]>([]);

  const [error, setError] = useState<string>("");
  const errorTimeoutRef = useRef<number | null>(null);

  const [interimTranscript, setInterimTranscript] = useState<string>("");
  const finalTranscriptRef = useRef<string>("");

  const connectionRef = useRef<LiveClient | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const reconnectAttemptsRef = useRef<number>(0);
  const maxReconnectAttempts = 3;

  const startRecording = async () => {
    resetAnalysis();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const deepgram = createClient(import.meta.env.VITE_DEEPGRAM_API_KEY);
      const connection = deepgram.listen.live({
        model: "nova-2",
        language: "en-US",
        punctuate: true,
        smart_format: true,
        interim_results: true,
      });

      connection.on(LiveTranscriptionEvents.Open, () => {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm;codecs=opus",
        });

        mediaRecorder.ondataavailable = async (event: BlobEvent) => {
          try {
            if (event.data.size > 0 && connection.getReadyState() === 1) {
              const buf = await event.data.arrayBuffer();
              connection.send(buf);
            }
          } catch (err) {
            console.error("Failed to send audio data:", err);
          }
        };

        mediaRecorder.start(100);
        mediaRecorderRef.current = mediaRecorder;
      });

      connection.on(LiveTranscriptionEvents.Transcript, async (data) => {
        const transcript = data.channel?.alternatives?.[0]?.transcript;
        const isFinal = data.is_final;

        if (transcript) {
          if (isFinal) {
            finalTranscriptRef.current = finalTranscriptRef.current
              ? finalTranscriptRef.current + " " + transcript
              : transcript;
            setInterimTranscript("");

            try {
              setIsProcessing(true);
              const response = await fetch(`${API_BASE_URL}/process_text`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text: finalTranscriptRef.current,
                }),
              });

              if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
              }

              const result: SentimentResponse = await response.json();
              setSentiment(result.sentiment || 0);
              setKeywords(result.keywords || []);

              setIsProcessing(false);
            } catch (err: any) {
              setIsProcessing(false);
              setErrorWithTimeout(
                "Failed to analyze sentiment. Please try again later"
              );
            }
          } else {
            setInterimTranscript(transcript);
          }
        }
      });

      connection.on(LiveTranscriptionEvents.Error, (_) => {
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setErrorWithTimeout(
            `Connection lost. Reconnecting... (${
              reconnectAttemptsRef.current + 1
            }/${maxReconnectAttempts})`
          );
          reconnectAttemptsRef.current++;

          // Retry after 2s
          stopRecording();
          setTimeout(() => startRecording(), 2000);
        } else {
          setErrorWithTimeout(
            "Connection failed after multiple attempts. Please try again."
          );
          stopRecording();
        }
      });

      connection.on(LiveTranscriptionEvents.Close, () => {
        // Unexpected close
        if (connectionRef.current) {
          stopRecording();
        }
      });

      connectionRef.current = connection;
      reconnectAttemptsRef.current = 0;
      setIsRecording(true);
    } catch (err) {
      setErrorWithTimeout(
        "Failed to access microphone. Please grant permission."
      );
      resetAnalysis();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);

    // Close Deepgram connection
    if (connectionRef.current) {
      connectionRef.current.requestClose();
      connectionRef.current = null;
    }
  };

  const resetAnalysis = () => {
    setSentiment(0);
    setKeywords([]);
    setInterimTranscript("");
    finalTranscriptRef.current = "";
  };

  const setErrorWithTimeout = (message: string, duration = 2000) => {
    setError(message);

    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }

    errorTimeoutRef.current = window.setTimeout(() => {
      setError("");
    }, duration);
  };

  const toggleRecording = useCallback((): void => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return {
    transcript: finalTranscriptRef.current + " " + interimTranscript,
    sentiment,
    keywords,
    isRecording,
    isProcessing,
    error,
    toggleRecording,
  };
};
