import { ChatCard } from '../molecules/ChatCard';
import type { Message } from './ChatMessages';

interface Chat {
  id: string;
  settings: {
    nivelDeIngles: string;
    linguagem: string;
    tipoDaConversa: string;
  };
  messages: Message[];
}

interface ChatListProps {
  chats: Chat[];
  onContinueChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export function ChatList({ chats, onContinueChat, onDeleteChat }: ChatListProps) {
  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (chats.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {chats.slice().reverse().map((chat) => (
        <ChatCard
          key={chat.id}
          title={chat.settings.tipoDaConversa}
          language={chat.settings.linguagem.charAt(0).toUpperCase() + chat.settings.linguagem.slice(1)}
          level={chat.settings.nivelDeIngles}
          date={formatDate(chat.id)}
          messageCount={chat.messages.length}
          onContinue={() => onContinueChat(chat.id)}
          onDelete={() => onDeleteChat(chat.id)}
        />
      ))}
    </div>
  );
}
