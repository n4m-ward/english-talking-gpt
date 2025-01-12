"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";

const AVAILABLE_LANGUAGES = {
  'português': 'pt-BR',
  'inglês': 'en-US',
  'espanhol': 'es-ES',
  'francês': 'fr-FR',
  'alemão': 'de-DE',
  'italiano': 'it-IT',
} as const;

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatData {
  id: string;
  settings: {
    nivelDeIngles: string;
    linguagem: string;
    tipoDaConversa: string;
  };
  messages: Message[];
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

export default function ChatPage() {
  const params = useParams();
  const chatId = params.id as string;
  
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const currentChat = chats.find((chat: ChatData) => chat.id === chatId);
    
    if (currentChat) {
      setChatData(currentChat);
      
      if (currentChat.messages.length === 0) {
        initiateConversation(currentChat);
      }
    }
  }, [chatId]);

  const startRecording = () => {
    if (!chatData) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Seu navegador não suporta gravação de voz.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    recognition.lang = AVAILABLE_LANGUAGES[chatData.settings.linguagem.toLowerCase() as keyof typeof AVAILABLE_LANGUAGES];
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setNewMessage(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Erro na gravação:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const getVoiceForLanguage = (language: string) => {
    const voices = window.speechSynthesis.getVoices();
    const langCode = AVAILABLE_LANGUAGES[language.toLowerCase() as keyof typeof AVAILABLE_LANGUAGES];
    return voices.find(voice => voice.lang.includes(langCode)) || voices[0];
  };

  const speakMessage = (message: string, messageId: string) => {
    if (!chatData) return;

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking === messageId) {
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.voice = getVoiceForLanguage(chatData.settings.linguagem);
    
    utterance.onend = () => {
      setIsSpeaking(null);
    };

    setIsSpeaking(messageId);
    window.speechSynthesis.speak(utterance);
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
      }`;

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Convert messages to the format expected by the API
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

  const updateChatInStorage = (updatedChat: ChatData) => {
    const chats = JSON.parse(localStorage.getItem("chats") || "[]");
    const updatedChats = chats.map((chat: ChatData) =>
      chat.id === chatId ? updatedChat : chat
    );
    localStorage.setItem("chats", JSON.stringify(updatedChats));
  };

  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
    };
  }, []);

  if (!chatData) {
    return <div className="flex items-center justify-center min-h-screen text-black">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-black">
          Conversando sobre: {chatData.settings.tipoDaConversa}
        </h1>
        <p className="text-sm text-black">
          Nível: {chatData.settings.nivelDeIngles} | Linguagem: {chatData.settings.linguagem}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatData.messages.map((message, index) => {
          const isCorrection = message.content.startsWith('🔍 Correção:');
          const isAssistant = message.role === "assistant";
          
          if (isCorrection) {
            return (
              <div
                key={index}
                className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg max-w-[80%] shadow"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-grow">
                    <div className="font-medium text-yellow-800">Correção</div>
                    <div className="text-yellow-700 mt-1">
                      {message.content.replace('🔍 Correção: ', '')}
                    </div>
                  </div>
                  <button
                    onClick={() => speakMessage(message.content.replace('🔍 Correção: ', ''), `msg-${index}`)}
                    className={`ml-2 p-2 rounded-full hover:bg-yellow-100 transition-colors ${
                      isSpeaking === `msg-${index}` ? 'bg-yellow-200' : ''
                    }`}
                    title={isSpeaking === `msg-${index}` ? "Parar" : "Ouvir"}
                  >
                    {isSpeaking === `msg-${index}` ? (
                      <span className="text-yellow-800">■</span>
                    ) : (
                      <span>🔊</span>
                    )}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={index}
              className={`p-4 rounded-lg max-w-[80%] ${
                message.role === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "bg-white text-black shadow"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <div>{message.content}</div>
                {message.role === "assistant" && (
                  <button
                    onClick={() => speakMessage(message.content, `msg-${index}`)}
                    className={`ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors ${
                      isSpeaking === `msg-${index}` ? 'bg-blue-100' : ''
                    }`}
                    title={isSpeaking === `msg-${index}` ? "Parar" : "Ouvir"}
                  >
                    {isSpeaking === `msg-${index}` ? (
                      <span className="text-blue-500">■</span>
                    ) : (
                      <span>🔊</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="bg-white p-4 rounded-lg shadow w-fit">
            <div className="animate-pulse text-black">Digitando...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 p-2 border rounded-md text-black"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`px-4 py-2 rounded-md transition-colors ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-black'
            }`}
            title={isRecording ? "Parar Gravação" : "Iniciar Gravação"}
          >
            {isRecording ? '⬤' : '🎤'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
