import { useState, useRef, useEffect } from "react";
import { Camera, Check, RotateCcw, Loader2, Upload } from "lucide-react";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Envie uma imagem (jpg, png, webp).");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Imagem muito grande. Escolha uma de até 8MB.");
      return;
    }
    setError(null);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        // Corta pro mesmo formato 4:5 do enquadramento da câmera, redimensiona
        // e comprime — mantém consistência com quem tira foto ao vivo.
        const targetRatio = 4 / 5;
        let sw = img.width, sh = img.height, sx = 0, sy = 0;
        const srcRatio = sw / sh;
        if (srcRatio > targetRatio) {
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = sw / targetRatio;
          sy = (img.height - sh) / 2;
        }
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        setCapturedImage(canvas.toDataURL("image/jpeg", 0.8));
        setStage("captured");
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
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
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

      {error && <p className="text-sm font-medium text-destructive text-center">{error}</p>}

      <div className="space-y-2">
        {stage === "idle" && (
          <>
            <button
              onClick={startCamera}
              className="btn-touch shadow-pop flex w-full items-center justify-center gap-3 bg-accent text-accent-foreground"
            >
              <Camera className="h-6 w-6" /> Abrir câmera
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`btn-touch flex w-full items-center justify-center gap-2 border-2 ${error ? "border-primary bg-primary/5 text-primary" : "border-border bg-card"}`}
            >
              <Upload className="h-5 w-5" /> {error ? "Enviar foto da galeria" : "Prefiro enviar uma foto"}
            </button>
          </>
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
