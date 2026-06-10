"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import DashboardLayout from "../layout";
import { API_BASE_URL } from "@/config/api";
import { Send, MessageCircle, ChevronLeft, X, Loader, UserCheck } from "lucide-react";

export default function MessagesPage() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mobileChat, setMobileChat] = useState(false);
  const chatEnd = useRef(null);

  useEffect(() => {
    const raw = typeof window !== "undefined" ? sessionStorage.getItem("currentUser") : null;
    const u = raw ? JSON.parse(raw) : null;
    setUser(u);
  }, []);

  const loadConversations = useCallback(async () => {
    if (!user?._id) return;
    const res = await fetch(`${API_BASE_URL}/messages/conversations/${user._id}`);
    const data = await res.json();
    if (data.success) setConversations(data.conversations);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openChat = async (otherUser) => {
    if (!user?._id) return;
    setActiveChat(otherUser);
    setMobileChat(true);
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/messages/${user._id}/${otherUser._id}`);
    const data = await res.json();
    if (data.success) setMessages(data.messages);
    setLoading(false);
    loadConversations();
  };

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user?._id || !activeChat) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: user._id, receiverId: activeChat._id, text: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setText("");
        loadConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-gray-500 font-black">در حال بارگذاری...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-6rem)] bg-[#0f1115] rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden flex" dir="rtl">
        <div className={`w-full md:w-80 lg:w-96 border-l border-gray-800 flex flex-col bg-[#1a1d23] ${mobileChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <MessageCircle className="text-yellow-400" size={22} />
              <h2 className="text-lg font-black text-white">پیام‌ها</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader size={24} className="animate-spin text-yellow-400" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <MessageCircle size={40} className="mb-3 opacity-40" />
                <p className="text-sm font-black">پیامی وجود ندارد</p>
                <p className="text-xs mt-1 text-gray-600">پیام‌های شما با ورزشکاران اینجا نمایش داده می‌شود</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = conv.withUser;
                const isUnread = conv.unread > 0;
                return (
                  <button
                    key={other._id}
                    onClick={() => openChat(other)}
                    className={`w-full text-right p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-all flex items-center gap-3 ${
                      activeChat?._id === other._id ? "bg-gray-800" : ""
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-yellow-400 font-black border border-gray-700 shrink-0">
                      {other.name?.charAt(0) || "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${isUnread ? "text-white font-black" : "text-gray-300 font-bold"}`}>
                          {other.name}
                        </p>
                        {isUnread && <span className="w-2 h-2 rounded-full bg-yellow-400 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{conv.lastMessage.text}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className={`flex-1 flex flex-col bg-[#0f1115] ${!mobileChat ? "hidden md:flex" : "flex"}`}>
          {activeChat ? (
            <>
              <div className="p-4 border-b border-gray-800 flex items-center gap-3 bg-[#1a1d23]">
                <button onClick={() => setMobileChat(false)} className="md:hidden text-gray-400 hover:text-white">
                  <ChevronLeft size={20} />
                </button>
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-yellow-400 font-black border border-gray-700">
                  {activeChat.name?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-white font-black text-sm">{activeChat.name}</p>
                  <p className="text-[10px] text-gray-500">{activeChat.employeeCode}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => {
                  const isMine = String(msg.senderId._id) === user._id;
                  return (
                    <div key={msg._id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                          isMine
                            ? "bg-gray-800 text-gray-200 rounded-br-md"
                            : "bg-yellow-400/10 text-yellow-100 border border-yellow-400/20 rounded-bl-md"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? "text-gray-600" : "text-yellow-400/60"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEnd} />
              </div>

              <div className="p-4 border-t border-gray-800 bg-[#1a1d23]">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 bg-[#0f1115] border border-gray-800 rounded-2xl py-3 px-4 text-white text-sm outline-none focus:border-yellow-400 transition-all"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !text.trim()}
                    className="bg-yellow-400 text-black p-3 rounded-2xl disabled:opacity-50 hover:bg-yellow-500 transition-all"
                  >
                    {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageCircle size={64} className="mb-4 opacity-30" />
              <p className="font-black text-lg">یک گفتگو را انتخاب کنید</p>
              <p className="text-sm mt-1 text-gray-600">از منوی سمت راست یک گفتگو را باز کنید</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
