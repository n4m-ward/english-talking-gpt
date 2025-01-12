"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
        {/* Nova Conversa */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6 text-center text-black">Nova Conversa</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Nível de Inglês
              </label>
              <select
                value={formData.nivelDeIngles}
                onChange={(e) => setFormData({ ...formData, nivelDeIngles: e.target.value })}
                className="w-full p-2 border rounded-md text-black"
                required
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Linguagem
              </label>
              <select
                value={formData.linguagem}
                onChange={(e) => setFormData({ ...formData, linguagem: e.target.value })}
                className="w-full p-2 border rounded-md text-black"
                required
              >
                {Object.keys(AVAILABLE_LANGUAGES).map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Tipo da Conversa
              </label>
              <input
                type="text"
                value={formData.tipoDaConversa}
                onChange={(e) => setFormData({ ...formData, tipoDaConversa: e.target.value })}
                className="w-full p-2 border rounded-md text-black"
                placeholder="Ex: Viagens, Trabalho, Hobbies"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Iniciar Conversa
            </button>
          </form>
        </div>

        {/* Lista de Conversas Anteriores */}
        {previousChats.length > 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-6 text-black">Conversas Anteriores</h2>
            <div className="space-y-4">
              {previousChats.slice().reverse().map((chat) => (
                <div key={chat.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium text-black">
                        {chat.settings.tipoDaConversa}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {chat.settings.linguagem.charAt(0).toUpperCase() + chat.settings.linguagem.slice(1)} • 
                        Nível {chat.settings.nivelDeIngles} •
                        {formatDate(chat.id)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {chat.messages.length} mensagens
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/chat/${chat.id}`)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        Continuar
                      </button>
                      <button
                        onClick={() => handleDeleteChat(chat.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
