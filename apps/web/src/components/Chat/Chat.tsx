import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useLocalParticipant, useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isOwn: boolean;
}

interface ChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Chat({ isOpen, onToggle }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!room) return;

    const handleDataReceived = (payload: Uint8Array, participant: any) => {
      const decoder = new TextDecoder();
      const data = JSON.parse(decoder.decode(payload));
      
      if (data.type === 'chat') {
        const message: ChatMessage = {
          id: Date.now().toString(),
          sender: participant?.name || 'Unknown',
          message: data.message,
          timestamp: new Date(),
          isOwn: participant?.sid === localParticipant?.sid,
        };
        setMessages(prev => [...prev, message]);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room, localParticipant]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !room || !localParticipant) return;

    const messageData = {
      type: 'chat',
      message: newMessage.trim(),
    };

    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(messageData));

    try {
      await localParticipant.publishData(data, { reliable: true });
      
      // Add own message to local state
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: localParticipant.name || 'You',
        message: newMessage.trim(),
        timestamp: new Date(),
        isOwn: true,
      };
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-20 lg:right-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-4 rounded-full shadow-2xl transform hover:scale-110 transition-all duration-200 z-50"
      >
        <Icon icon="solar:chat-round-dots-bold" className="size-6 text-white" />
        {messages.length > 0 && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {messages.length > 99 ? '99+' : messages.length}
          </div>
        )}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <Icon icon="solar:chat-round-dots-bold" className="size-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Chat</h3>
          <div className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
            {messages.length}
          </div>
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Icon icon="solar:close-circle-bold" className="size-5 text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <Icon icon="solar:chat-round-line" className="size-12 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                  message.isOwn
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {!message.isOwn && (
                  <p className="text-xs font-medium mb-1 opacity-75">
                    {message.sender}
                  </p>
                )}
                <p className="text-sm break-words">{message.message}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200/50">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-800"
            maxLength={500}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
          >
            <Icon icon="solar:plain-2-bold" className="size-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to send • {newMessage.length}/500
        </p>
      </div>
    </div>
  );
}
