import { useState, useRef, useEffect } from "react";
import { Camera, Check, RotateCcw, Loader2 } from "lucide-react";

interface CameraSelfieProps {
  onCapture: (dataUri: string) => void;
  onError?: (error: string) => void;
}

export function CameraSelfie({ onCapture, onError }: CameraSelfieProps) {
  const [stage, setStage] = useState<"idle" | "preview" | "captured">("idle");
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStage("preview");
    } catch (e) {
      const err = e as { name?: string };
      let msg = "Não foi possível acessar a câmera.";
      if (err.name === "NotAllowedError") {
        msg = "Permita o acesso à câmera nas configurações do navegador.";
      } else if (err.name === "NotFoundError") {
        msg = "Câmera não encontrada neste dispositivo.";
      } else if (err.name === "NotReadableError") {
        msg = "A câmera está em uso por outro aplicativo.";
      }
      setError(msg);
      onError?.(msg);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    const dataUri = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(dataUri);
    setStage("captured");

    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const retake = async () => {
    setCapturedImage(null);
    setError(null);
    await startCamera();
  };

  const confirmPhoto = async () => {
    if (!capturedImage) return;
    setCompressing(true);
    try {
      onCapture(capturedImage);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl border-2 border-border bg-black shadow-soft aspect-[4/5]">
        {stage === "captured" && capturedImage ? (
          <img src={capturedImage} alt="Selfie capturada" className="w-full h-full object-cover" />
        ) : (
          <>
            <video
              ref={videoRef}
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {stage === "idle" && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur">
                <Camera className="h-16 w-16 text-white mb-2" />
                <p className="text-white font-semibold text-center px-4">
                  Clique no botão para começar
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}

      <div className="space-y-2">
        {stage === "idle" && (
          <button
            onClick={startCamera}
            className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-accent text-accent-foreground"
          >
            <Camera className="h-6 w-6" /> Abrir câmera
          </button>
        )}

        {stage === "preview" && (
          <button
            onClick={capturePhoto}
            className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-primary text-primary-foreground"
          >
            <Camera className="h-6 w-6" /> Tirar foto
          </button>
        )}

        {stage === "captured" && (
          <>
            <button
              onClick={confirmPhoto}
              disabled={compressing}
              className="btn-touch shadow-pop flex w-full items-center justify-center gap-2 bg-accent text-accent-foreground disabled:opacity-70"
            >
              {compressing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {compressing ? "Processando…" : "Confirmar selfie"}
            </button>
            <button
              onClick={retake}
              className="btn-touch flex w-full items-center justify-center gap-2 border-2 border-border bg-card"
            >
              <RotateCcw className="h-5 w-5" /> Tirar outra
            </button>
          </>
        )}
      </div>
    </div>
  );
}
