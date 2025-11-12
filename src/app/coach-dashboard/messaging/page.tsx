
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Send,
  MoreVertical,
  Paperclip,
  ArrowLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const conversations = [
  {
    id: 1,
    name: 'Alex Thompson',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    lastMessage: 'Perfect, thank you!',
    time: '2m ago',
    unread: 2,
    role: 'Student',
  },
  {
    id: 2,
    name: 'Sarah K.',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'Sure, I can help with that.',
    time: '1h ago',
    unread: 0,
    role: 'Student',
  },
  {
    id: 3,
    name: 'Michael T.',
    avatar: 'https://i.pravatar.cc/150?u=michael',
    lastMessage: 'Do you have time for a quick chat tomorrow?',
    time: '3h ago',
    unread: 0,
    role: 'Student',
  },
];

const messages = {
  1: [
    {
      id: 1,
      sender: 'Adrian Cucurella',
      text: 'Hi Alex, thanks for reaching out. How can I help you prepare for your case interview?',
      timestamp: '10:30 AM',
      isMe: true,
    },
    {
      id: 2,
      sender: 'Alex Thompson',
      text: "Hi Adrian, I'm looking for guidance on structuring my responses and managing time effectively.",
      timestamp: '10:32 AM',
      isMe: false,
    },
    {
      id: 3,
      sender: 'Adrian Cucurella',
      text: 'Great. We can start by running through a mock case. Does that sound good?',
      timestamp: '10:35 AM',
      isMe: true,
    },
     {
      id: 4,
      sender: 'Alex Thompson',
      text: 'Perfect, thank you!',
      timestamp: '10:36 AM',
      isMe: false,
    },
  ],
  2: [
     {
      id: 1,
      sender: 'Adrian Cucurella',
      text: 'Hi Sarah, I saw you enrolled in the Consulting program. Do you have any questions?',
      timestamp: '9:00 AM',
      isMe: true,
    },
    {
      id: 2,
      sender: 'Sarah K.',
      text: "Hi Adrian! Yes, I was wondering if you could recommend any resources for a beginner.",
      timestamp: '9:02 AM',
      isMe: false,
    },
    {
      id: 3,
      sender: 'Adrian Cucurella',
      text: 'Sure, I can help with that.',
      timestamp: '9:05 AM',
      isMe: true,
    },
  ],
  3: [
    {
      id: 1,
      sender: 'Michael T.',
      text: 'Hi Adrian, I have a few questions about the upcoming session.',
      timestamp: '7:00 AM',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Adrian Cucurella',
      text: 'Hi Michael, of course. Ask away.',
      timestamp: '7:01 AM',
      isMe: true,
    },
     {
      id: 3,
      sender: 'Michael T.',
      text: 'Do you have time for a quick chat tomorrow?',
      timestamp: '7:05 AM',
      isMe: false,
    },
  ],
};

const currentUser = {
    name: 'Adrian Cucurella',
    avatar: 'https://i.pravatar.cc/150?u=adrian-cucurella'
}

function MessagingPageContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('conversationId');

  const [selectedConversation, setSelectedConversation] = useState(() => {
    if (conversationId) {
      const convo = conversations.find(c => c.id.toString() === conversationId);
      return convo || conversations[0];
    }
    return null;
  });
  
  const [newMessage, setNewMessage] = useState('');
  const [currentMessages, setCurrentMessages] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const initialConvo = conversationId
      ? conversations.find(c => c.id.toString() === conversationId)
      : conversations[0];

    if (initialConvo) {
      setSelectedConversation(initialConvo);
      setCurrentMessages(messages[initialConvo.id as keyof typeof messages] || []);
    }
  }, [conversationId]);


  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    setCurrentMessages(messages[conversation.id as keyof typeof messages] || []);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(newMessage.trim() === '') return;
    
    const newMsg = {
        id: currentMessages.length + 1,
        sender: currentUser.name,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isMe: true,
    }
    setCurrentMessages([...currentMessages, newMsg]);
    setNewMessage('');
  };

  const filteredConversations = conversations.filter(convo => 
    convo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <div className="grid md:grid-cols-4 flex-1">
        {/* Conversation List */}
        <div className={cn("flex flex-col border-r", selectedConversation && "hidden md:flex")}>
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className={cn(
                  'flex cursor-pointer items-start gap-4 p-4 hover:bg-muted/50',
                  selectedConversation?.id === convo.id && 'bg-muted'
                )}
                onClick={() => handleSelectConversation(convo)}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} />
                  <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate font-semibold">{convo.name}</h4>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{convo.time}</p>
                  </div>
                  <div className="flex items-start justify-between">
                    <p className="truncate text-sm text-muted-foreground">{convo.lastMessage}</p>
                    {convo.unread > 0 && (
                        <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground flex-shrink-0">
                            {convo.unread}
                        </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className={cn("md:col-span-3 flex flex-col h-full", !selectedConversation && "hidden md:flex")}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b p-4">
                 <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{selectedConversation.name}</h4>
                  <p className="text-xs text-muted-foreground">{selectedConversation.role}</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1">
                  <div className="space-y-6 p-6">
                    {currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex items-end gap-3',
                          msg.isMe ? 'justify-end' : 'justify-start'
                        )}
                      >
                          {!msg.isMe && (
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={selectedConversation.avatar} />
                                  <AvatarFallback>{selectedConversation.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          )}
                          <Card
                          className={cn(
                              'max-w-xs md:max-w-md p-3 rounded-2xl',
                              msg.isMe
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          )}
                          >
                              <p className="text-sm">{msg.text}</p>
                              <p className={cn("text-xs mt-2", msg.isMe ? "text-primary-foreground/70 text-right" : "text-muted-foreground/70 text-left")}>{msg.timestamp}</p>
                          </Card>
                          {msg.isMe && (
                              <Avatar className="h-8 w-8">
                                  <AvatarImage src={currentUser.avatar} />
                                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                          )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
             
              {/* Message Input */}
              <div className="border-t bg-background p-4 z-10">
                <form onSubmit={handleSendMessage}>
                  <div className="relative">
                    <Input
                      placeholder="Type a message..."
                      className="pr-24"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
                        <Button variant="ghost" size="icon" type="button">
                            <Paperclip className="h-5 w-5 text-muted-foreground"/>
                        </Button>
                        <Separator orientation="vertical" className="mx-1 h-6" />
                        <Button type="submit" variant="ghost" size="icon">
                            <Send className="h-5 w-5 text-primary" />
                        </Button>
                    </div>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagingPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <MessagingPageContent />
        </React.Suspense>
    )
}
