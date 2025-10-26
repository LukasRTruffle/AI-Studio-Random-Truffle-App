import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import Button from './ui/Button';
import Input from './ui/Input';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

const ChatInterface: React.FC<{onSendMessage: (message: string) => Promise<string>}> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Generate unique message ID
  const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;
    const userMessage: Message = {
      id: generateMessageId(),
      text: input,
      sender: 'user'
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
        const botResponseText = await onSendMessage(currentInput);
        const botMessage: Message = {
          id: generateMessageId(),
          text: botResponseText,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
    } catch (error) {
        const errorMessage: Message = {
          id: generateMessageId(),
          text: "Sorry, I encountered an error.",
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-white shadow-md">
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-200">...</div></div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t flex items-center">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="ml-2">
            <Icon name="send" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
