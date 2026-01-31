"use client";

import React from "react"

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Minimize2,
  Maximize2,
  Users,
  ArrowLeft,
} from "lucide-react";

interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
  };
  content: string;
  timestamp: string;
}

interface ChatUser {
  id: number;
  username: string;
  blood_group?: string;
  last_message?: string;
  unread_count?: number;
}

export function ChatWindow() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chat users/conversations when chat opens
  useEffect(() => {
    if (isOpen && isAuthenticated && !activeChat) {
      fetchChatUsers();
    }
  }, [isOpen, isAuthenticated, activeChat]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  // Poll for new messages every 5 seconds when chat is active
  useEffect(() => {
    if (!activeChat || !isOpen) return;

    const interval = setInterval(() => {
      fetchMessages(activeChat.id);
    }, 5000);

    return () => clearInterval(interval);
  }, [activeChat, isOpen]);

  // Listen for startChat events from donor cards
  useEffect(() => {
    const handleStartChatEvent = (event: CustomEvent<ChatUser>) => {
      setIsOpen(true);
      setIsMinimized(false);
      setActiveChat(event.detail);
    };

    window.addEventListener("startChat", handleStartChatEvent as EventListener);
    return () => {
      window.removeEventListener("startChat", handleStartChatEvent as EventListener);
    };
  }, []);

  const fetchChatUsers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/chat/conversations/");
      setChatUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch chat users:", error);
      // Set mock data for demo if API fails
      setChatUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      const response = await api.get(`/chat/messages/${userId}/`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || isSending) return;

    setIsSending(true);
    try {
      const response = await api.post("/chat/send/", {
        receiver_id: activeChat.id,
        content: newMessage.trim(),
      });
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const startChat = (chatUser: ChatUser) => {
    setActiveChat(chatUser);
  };

  const backToList = () => {
    setActiveChat(null);
    setMessages([]);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-200 ${
            isMinimized
              ? "w-72 h-14"
              : "w-80 sm:w-96 h-[500px] max-h-[80vh]"
          }`}
        >
          {/* Header */}
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              {activeChat && !isMinimized && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={backToList}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-sm font-semibold">
                {activeChat ? activeChat.username : "Messages"}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setIsOpen(false);
                  setActiveChat(null);
                  setMessages([]);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col h-[calc(100%-56px)]">
              {!activeChat ? (
                // Chat Users List
                <ScrollArea className="flex-1">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : chatUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                      <Users className="h-12 w-12 text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No conversations yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Start a chat from a donor&apos;s profile
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {chatUsers.map((chatUser) => (
                        <button
                          key={chatUser.id}
                          onClick={() => startChat(chatUser)}
                          className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {chatUser.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {chatUser.username}
                            </p>
                            {chatUser.blood_group && (
                              <p className="text-xs text-muted-foreground">
                                Blood Group: {chatUser.blood_group}
                              </p>
                            )}
                            {chatUser.last_message && (
                              <p className="text-xs text-muted-foreground truncate">
                                {chatUser.last_message}
                              </p>
                            )}
                          </div>
                          {chatUser.unread_count && chatUser.unread_count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {chatUser.unread_count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              ) : (
                // Messages View
                <>
                  <ScrollArea className="flex-1 p-3">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center">
                        <MessageCircle className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          No messages yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Send a message to start the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender.id === user?.id
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[75%] rounded-lg px-3 py-2 ${
                                message.sender.id === user?.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm break-words">
                                {message.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender.id === user?.id
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {new Date(message.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <form
                    onSubmit={sendMessage}
                    className="p-3 border-t flex gap-2"
                  >
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      disabled={isSending}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </>
  );
}
