import { MessageBubble } from '../molecules/MessageBubble';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessagesProps {
  messages: Message[];
  onSpeak: (text: string, id: string) => void;
  isSpeaking: string | null;
  isLoading: boolean;
}

export function ChatMessages({ 
  messages, 
  onSpeak, 
  isSpeaking,
  isLoading 
}: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isCorrection = message.content.startsWith('🔍 Correção:');
        
        return (
          <MessageBubble
            key={index}
            content={message.content}
            role={message.role}
            isCorrection={isCorrection}
            onSpeak={message.role === 'assistant' ? 
              () => onSpeak(
                isCorrection ? message.content.replace('🔍 Correção: ', '') : message.content,
                `msg-${index}`
              ) : undefined}
            isSpeaking={isSpeaking === `msg-${index}`}
          />
        );
      })}
      
      {isLoading && (
        <div className="bg-white p-4 rounded-lg shadow w-fit">
          <div className="animate-pulse text-black">Digitando...</div>
        </div>
      )}
    </div>
  );
}
