import { MessageText } from '../atoms/MessageText';
import { IconButton } from '../atoms/IconButton';
import type { Message } from '../organisms/ChatMessages';

interface MessageBubbleProps {
  content: string;
  role: Message['role'];
  isCorrection?: boolean;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export function MessageBubble({ 
  content, 
  role, 
  isCorrection = false,
  onSpeak,
  isSpeaking = false
}: MessageBubbleProps) {
  const bubbleClasses = {
    user: 'ml-auto bg-blue-500',
    assistant: isCorrection 
      ? 'bg-yellow-50 border-l-4 border-yellow-400' 
      : 'bg-white',
  } as const;

  return (
    <div className={`p-4 rounded-lg max-w-[80%] shadow ${bubbleClasses[role]}`}>
      <div className="flex justify-between items-start gap-2">
        {isCorrection && (
          <div className="font-medium text-yellow-800 mb-1">Correção</div>
        )}
        <MessageText 
          content={isCorrection ? content.replace('🔍 Correção: ', '') : content} 
          variant={isCorrection ? 'correction' : role}
        />
        {role === 'assistant' && onSpeak && (
          <IconButton
            icon={isSpeaking ? '■' : '🔊'}
            onClick={onSpeak}
            active={isSpeaking}
            variant={isCorrection ? 'warning' : 'primary'}
            title={isSpeaking ? "Parar" : "Ouvir"}
          />
        )}
      </div>
    </div>
  );
}
