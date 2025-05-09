
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';
import { Loader2, Send, X, Bot, UserRound } from 'lucide-react';
import { ChatbotService, ChatMessage } from '@/services/ChatbotService';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { useDeclarations } from '@/context/DeclarationContext';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatbotPanel = ({ isOpen, onClose }: ChatbotPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { declarations } = useDeclarations();

  useEffect(() => {
    // Message de bienvenue initial
    if (messages.length === 0 && isOpen) {
      const welcomeMessage = {
        id: ChatbotService.generateUniqueId(),
        text: `Bonjour ${user?.first_name || 'cher utilisateur'}! Je suis l'assistant virtuel de Polytech Tours. Comment puis-je vous aider aujourd'hui ?`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages.length]);

  useEffect(() => {
    // Faire défiler vers le dernier message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Focus sur le champ de saisie quand le chatbot est ouvert
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    const newUserMessage: ChatMessage = {
      id: ChatbotService.generateUniqueId(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date()
    };
    
    const loadingMessage: ChatMessage = {
      id: ChatbotService.generateUniqueId(),
      text: '...',
      isUser: false,
      timestamp: new Date(),
      loading: true
    };
    
    setMessages(prev => [...prev, newUserMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const { response } = await ChatbotService.sendMessage(
        inputMessage, 
        user?.role || null,
        declarations
      );
      
      // Remplacer le message de chargement par la réponse
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? {
          ...msg,
          text: response,
          loading: false
        } : msg
      ));
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast.error("Erreur lors de la communication avec l'assistant");
      
      // Remplacer le message de chargement par un message d'erreur
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id ? {
          ...msg,
          text: "Désolé, je rencontre des difficultés à traiter votre demande actuellement.",
          loading: false
        } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const getInitials = (name: string | undefined | null) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const getRandomBackground = (id: string) => {
    const colors = ['bg-indigo-100', 'bg-purple-100', 'bg-pink-100', 'bg-cyan-100'];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="fixed bottom-4 right-4 w-full sm:w-96 z-50 animate-scale-in">
      <Card className="shadow-lg border-gray-200 overflow-hidden">
        <CardHeader className="bg-indigo-50 border-b border-gray-200 p-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-indigo-800 flex items-center">
            <Bot className="h-5 w-5 mr-2 text-indigo-700" />
            Assistant Polytech
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-indigo-100 transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-[350px] p-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex items-start mb-4 ${message.isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                {!message.isUser && (
                  <Avatar className={`h-8 w-8 mr-2 bg-indigo-100 text-indigo-800 flex items-center justify-center`}>
                    <Bot className="h-5 w-5" />
                  </Avatar>
                )}
                
                <div 
                  className={`px-4 py-2 rounded-lg max-w-[75%] transition-all ${
                    message.isUser 
                      ? 'bg-indigo-600 text-white shadow-md hover:shadow-lg' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {message.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
                
                {message.isUser && (
                  <Avatar className={`h-8 w-8 ml-2 ${getRandomBackground(message.id)} flex items-center justify-center`}>
                    <UserRound className="h-5 w-5 text-indigo-700" />
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        
        <CardFooter className="border-t p-2 bg-gray-50">
          <div className="flex w-full items-center space-x-2">
            <Input
              ref={inputRef}
              placeholder="Écrivez votre message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-grow focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChatbotPanel;
