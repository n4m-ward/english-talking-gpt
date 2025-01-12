"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ChatMessages } from "@/components/organisms/ChatMessages";
import { MessageInput } from "@/components/molecules/MessageInput";

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

export default function ChatPage() {
  const params = useParams();
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const currentChat = chats.find((chat: ChatData) => chat.id === params.id);
    
    if (currentChat) {
      setChatData(currentChat);
      if (!currentChat.messages.length) {
        initiateConversation(currentChat);
      }
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewMessage(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
      }
    };
  }, [params.id]);

  const updateChatInStorage = (updatedChat: ChatData) => {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const updatedChats = chats.map((chat: ChatData) =>
      chat.id === updatedChat.id ? updatedChat : chat
    );
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  const initiateConversation = async (chat: ChatData) => {
    setIsLoading(true);
    
    try {
      const systemMessage = `Você é um assistente de conversação em ${chat.settings.linguagem}. 
      O nível do usuário em ${chat.settings.linguagem} é ${chat.settings.nivelDeIngles}. 
      Você deve manter a conversa sobre: ${chat.settings.tipoDaConversa}.
      Você deve responder apenas no seguinte formato JSON:
      {
        "mensagem": "sua mensagem em ${chat.settings.linguagem}",
        "correcao": "se houver algum erro na mensagem do usuário, explique em português o que está errado e como corrigir. Se não houver erros, deixe vazio"
      }
        
      Sempre que notar um erro na mensagem do usuário, explique o que esta errado e como corrigir.
      `;

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Vamos começar nossa conversa sobre ${chat.settings.tipoDaConversa}?`,
          systemMessage,
          context: [],
        }),
      });

      const data = await response.json();
      const parsedResponse = JSON.parse(data.message);
      
      const updatedMessages = [
        { role: "assistant", content: parsedResponse.mensagem },
      ];
      
      const updatedChat = { ...chat, messages: updatedMessages };
      updateChatInStorage(updatedChat);
      setChatData(updatedChat);
    } catch (error) {
      console.error("Error initiating conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatData || isLoading) return;

    const userMessage = { role: "user" as const, content: newMessage };
    const updatedChat = {
      ...chatData,
      messages: [...chatData.messages, userMessage],
    };
    
    updateChatInStorage(updatedChat);
    setChatData(updatedChat);
    setNewMessage("");
    setIsLoading(true);

    try {
      const systemMessage = `Você é um assistente de conversação em ${chatData.settings.linguagem}. 
      O nível do usuário em ${chatData.settings.linguagem} é ${chatData.settings.nivelDeIngles}. 
      Você deve manter a conversa sobre: ${chatData.settings.tipoDaConversa}.
      Você deve responder apenas no seguinte formato JSON:
      {
        "mensagem": "sua mensagem em ${chatData.settings.linguagem}",
        "correcao": "se houver algum erro na mensagem do usuário, explique em português o que está errado e como corrigir. Se não houver erros, deixe vazio"
      }
        
      Sempre que notar um erro na mensagem do usuário, explique o que esta errado e como corrigir.
      `;

      const apiMessages = updatedChat.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage,
          systemMessage,
          context: apiMessages,
        }),
      });

      const data = await response.json();
      const parsedResponse = JSON.parse(data.message);
      
      const assistantMessage = { role: "assistant" as const, content: parsedResponse.mensagem };
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
      };
      
      updateChatInStorage(finalChat);
      setChatData(finalChat);

      if (parsedResponse.correcao) {
        const correctionMessage = { 
          role: "assistant" as const, 
          content: `🔍 Correção: ${parsedResponse.correcao}` 
        };
        const chatWithCorrection = {
          ...finalChat,
          messages: [...finalChat.messages, correctionMessage],
        };
        updateChatInStorage(chatWithCorrection);
        setChatData(chatWithCorrection);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartRecording = () => {
    if (!recognition) return;

    if (isRecording) {
      recognition.stop();
    } else {
      setNewMessage('');
      recognition.lang = chatData?.settings.linguagem === 'inglês' ? 'en-US' : 'pt-BR';
      recognition.start();
      setIsRecording(true);
    }
  };

  const speakMessage = (text: string, id: string) => {
    if (typeof window === 'undefined') return;

    if (isSpeaking === id) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const languageCode = chatData?.settings.linguagem === 'inglês' ? 'en-US' : 'pt-BR';
    const voice = voices.find(v => v.lang === languageCode);
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onend = () => setIsSpeaking(null);
    setIsSpeaking(id);
    window.speechSynthesis.speak(utterance);
  };

  if (!chatData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white shadow px-4 py-2">
        <h1 className="text-xl font-semibold text-black">
          {chatData.settings.tipoDaConversa}
        </h1>
        <p className="text-sm text-gray-600">
          {chatData.settings.linguagem} • Nível {chatData.settings.nivelDeIngles}
        </p>
      </div>

      <ChatMessages
        messages={chatData.messages}
        onSpeak={speakMessage}
        isSpeaking={isSpeaking}
        isLoading={isLoading}
      />

      <MessageInput
        value={newMessage}
        onChange={setNewMessage}
        onSend={handleSendMessage}
        onStartRecording={handleStartRecording}
        isRecording={isRecording}
        isLoading={isLoading}
      />
    </div>
  );
}
