import { IconButton } from '../atoms/IconButton';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStartRecording: () => void;
  isRecording: boolean;
  isLoading: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onStartRecording,
  isRecording,
  isLoading
}: MessageInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSend();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-white p-4 border-t">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 border rounded-md"
        placeholder="Digite sua mensagem..."
      />
      <IconButton
        icon="🎤"
        onClick={onStartRecording}
        active={isRecording}
        type="button"
        title={isRecording ? "Parar Gravação" : "Iniciar Gravação"}
      />
      <IconButton
        icon="➤"
        type="submit"
        disabled={!value.trim() || isLoading}
        className={!value.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''}
      />
    </form>
  );
}
