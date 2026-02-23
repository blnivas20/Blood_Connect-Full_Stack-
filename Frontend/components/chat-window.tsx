"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Heart,
  HandHeart,
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
  unique_id: string;
  blood_group?: string;
  last_message?: string;
  unread_count?: number;
}

interface ConversationData {
  as_requester: ChatUser[];
  as_donor: ChatUser[];
}

type ConversationTab = "as_requester" | "as_donor";

export function ChatWindow() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [token , setToken] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeChat, setActiveChat] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversations, setConversations] = useState<ConversationData>({
    as_requester: [],
    as_donor: [],
  });
  const [activeTab, setActiveTab] = useState<ConversationTab>("as_requester");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // ---------------- SCROLL ----------------
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (activeChat && !isMinimized) scrollToBottom("instant");
  }, [activeChat, isMinimized, scrollToBottom]);

  useEffect(() => {
    if (activeChat && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [activeChat, isMinimized]);

  useEffect(()=>{
    setToken(localStorage.getItem("access_token"));
  });

  // ---------------- FETCH CONVERSATIONS ----------------
  useEffect(() => {
    if (isOpen && isAuthenticated && !activeChat) {
      fetchConversations();
    }
  }, [isOpen, isAuthenticated, activeChat]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/chat/conversations/");
      setConversations({
        as_requester: res.data.as_requester ?? [],
        as_donor: res.data.as_donor ?? [],
      });
    } catch {
      setConversations({ as_requester: [], as_donor: [] });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- LOAD OLD MESSAGES ----------------
  useEffect(() => {
    if (!activeChat) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/chat/messages/${activeChat.unique_id}/?token=${token}`
        );
        setMessages(res.data);
        scrollToBottom("instant");
      } catch {
        setMessages([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [activeChat]);

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    if (!activeChat || !isAuthenticated) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket(
      `wss://bloodconnect-eywo.onrender.com/ws/chat/${activeChat.unique_id}/?token=${token}`
    );
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setMessages((prev) => {
        const isDuplicate = prev.some(
          (m) =>
            m.sender.id === data.sender_id &&
            m.content === data.message &&
            Math.abs(new Date(m.timestamp).getTime() - Date.now()) < 2000
        );
        if (isDuplicate) return prev;

        return [
          ...prev,
          {
            id: Date.now(),
            sender: { id: data.sender_id, username: data.username },
            content: data.message,
            timestamp: new Date().toISOString(),
          },
        ];
      });
    };

    socket.onerror = () => console.error("WebSocket error");
    socket.onclose = () => console.log("WebSocket closed");

    return () => socket.close();
  }, [activeChat, isAuthenticated]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (
      !trimmed ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    )
      return;

    setIsSending(true);
    socketRef.current.send(JSON.stringify({ message: trimmed }));
    setNewMessage("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      setIsSending(false);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  // ---------------- EVENTS ----------------
  useEffect(() => {
    const handleStartChatEvent = (event: CustomEvent<ChatUser>) => {
      setIsOpen(true);
      setIsMinimized(false);
      setActiveChat(event.detail);
      setMessages([]);
    };
    window.addEventListener("startChat", handleStartChatEvent as EventListener);
    return () =>
      window.removeEventListener(
        "startChat",
        handleStartChatEvent as EventListener
      );
  }, []);

  const backToList = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setActiveChat(null);
    setMessages([]);
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveChat(null);
    setMessages([]);
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
  };

  const openChat = (chatUser: ChatUser) => {
    setMessages([]);
    setActiveChat(chatUser);
  };

  const currentList = conversations[activeTab];

  if (!isAuthenticated) return null;

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {isOpen && (
        <Card
          className={`fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-200 flex flex-col ${
            isMinimized
              ? "w-72 h-14"
              : "w-80 sm:w-96 h-[540px] max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <CardHeader className="p-3 border-b flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {activeChat && !isMinimized && (
                <Button variant="ghost" size="icon" onClick={backToList}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <CardTitle className="text-sm font-semibold truncate max-w-[140px]">
                {activeChat ? activeChat.username : "Messages"}
              </CardTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {/* Body */}
          {!isMinimized && (
            <CardContent className="p-0 flex flex-col flex-1 overflow-hidden">
              {!activeChat ? (
                <>
                  {/* ---- Tab toggle ---- */}
                  <div className="flex border-b shrink-0">
                    <button
                      onClick={() => setActiveTab("as_requester")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                        activeTab === "as_requester"
                          ? "border-b-2 border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart className="h-3.5 w-3.5" />
                      My Requests
                      {conversations.as_requester.length > 0 && (
                        <span className="ml-1 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                          {conversations.as_requester.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("as_donor")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                        activeTab === "as_donor"
                          ? "border-b-2 border-primary text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <HandHeart className="h-3.5 w-3.5" />
                      My Donations
                      {conversations.as_donor.length > 0 && (
                        <span className="ml-1 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px]">
                          {conversations.as_donor.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* ---- Conversation list ---- */}
                  <ScrollArea className="flex-1">
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : currentList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-52 text-center px-4">
                        <Users className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {activeTab === "as_requester"
                            ? "No request conversations yet"
                            : "No donation conversations yet"}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y">
                        {currentList.map((chatUser) => (
                          <button
                            key={chatUser.unique_id}
                            onClick={() => openChat(chatUser)}
                            className="w-full p-3 flex items-center gap-3 hover:bg-muted/50 text-left"
                          >
                            <Avatar>
                              <AvatarFallback>
                                {chatUser.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="font-medium text-sm truncate">
                                  {chatUser.username}
                                </p>
                                {chatUser.blood_group && (
                                  <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded px-1 py-0.5 font-medium shrink-0">
                                    {chatUser.blood_group}
                                  </span>
                                )}
                              </div>
                              {chatUser.last_message && (
                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                  {chatUser.last_message}
                                </p>
                              )}
                            </div>
                            {!!chatUser.unread_count && (
                              <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 shrink-0">
                                {chatUser.unread_count}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </>
              ) : (
                // ---- Active chat ----
                <>
                  <div
                    ref={scrollAreaRef}
                    className="flex-1 overflow-y-auto p-3 min-h-0"
                  >
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message) => {
                          const isOwn =
                            message.sender.username === user?.username;
                          return (
                            <div
                              key={message.id}
                              className={`flex ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[75%] rounded-lg px-3 py-2 ${
                                  isOwn
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                }`}
                              >
                                <p className="text-sm break-words">
                                  {message.content}
                                </p>
                                <p className="text-xs mt-1 opacity-70">
                                  {new Date(
                                    message.timestamp
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <form
                    onSubmit={sendMessage}
                    className="p-3 border-t flex gap-2 shrink-0"
                  >
                    <Input
                      ref={inputRef}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message…"
                      autoComplete="off"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={!newMessage.trim() || isSending}
                    >
                      <Send className="h-4 w-4" />
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