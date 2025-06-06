
import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

interface ChatbotButtonProps {
  onClick: () => void;
}

const ChatbotButton = ({ onClick }: ChatbotButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg flex items-center justify-center p-0 z-40 transition-all duration-300 hover:scale-110 active:scale-95 animate-bounce-subtle"
      aria-label="Ouvrir l'assistant"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};

export default ChatbotButton;
