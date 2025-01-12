"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/atoms/Card";
import { NewChatForm } from "@/components/molecules/NewChatForm";
import { ChatList } from "@/components/organisms/ChatList";

const AVAILABLE_LANGUAGES = {
  'português': 'pt-BR',
  'inglês': 'en-US',
  'espanhol': 'es-ES',
  'francês': 'fr-FR',
  'alemão': 'de-DE',
  'italiano': 'it-IT',
} as const;

interface ChatData {
  id: string;
  settings: {
    nivelDeIngles: string;
    linguagem: string;
    tipoDaConversa: string;
  };
  messages: Array<{
    role: string;
    content: string;
  }>;
}

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nivelDeIngles: "iniciante",
    linguagem: "português",
    tipoDaConversa: "",
  });
  const [previousChats, setPreviousChats] = useState<ChatData[]>([]);

  useEffect(() => {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    setPreviousChats(chats);
  }, []);

  const handleFormDataChange = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const chatId = Date.now().toString();
    const chatData = {
      id: chatId,
      settings: formData,
      messages: []
    };
    
    const updatedChats = [...previousChats, chatData];
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    setPreviousChats(updatedChats);
    
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = previousChats.filter(chat => chat.id !== chatId);
    localStorage.setItem("chats", JSON.stringify(updatedChats));
    setPreviousChats(updatedChats);
  };

  const handleContinueChat = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp)).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <h1 className="text-2xl font-bold mb-6 text-center text-black">
            Nova Conversa
          </h1>
          <NewChatForm
            formData={formData}
            onFormDataChange={handleFormDataChange}
            onSubmit={handleSubmit}
          />
        </Card>

        {previousChats.length > 0 && (
          <Card>
            <h2 className="text-xl font-bold mb-6 text-black">
              Conversas Anteriores
            </h2>
            <ChatList
              chats={previousChats}
              onContinueChat={handleContinueChat}
              onDeleteChat={handleDeleteChat}
            />
          </Card>
        )}
      </div>
    </div>
  );
}
