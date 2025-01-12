import { Button } from '../atoms/Button';

interface ChatCardProps {
  title: string;
  language: string;
  level: string;
  date: string;
  messageCount: number;
  onContinue: () => void;
  onDelete: () => void;
}

export function ChatCard({
  title,
  language,
  level,
  date,
  messageCount,
  onContinue,
  onDelete,
}: ChatCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="font-medium text-black">{title}</h3>
          <p className="text-sm text-gray-600">
            {language} • Nível {level} • {date}
          </p>
          <p className="text-sm text-gray-500">{messageCount} mensagens</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={onContinue}
            className="px-3 py-1 text-sm"
          >
            Continuar
          </Button>
          <Button
            variant="warning"
            onClick={onDelete}
            className="px-3 py-1 text-sm"
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
