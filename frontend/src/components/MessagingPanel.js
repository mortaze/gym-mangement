"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/config/api";
import { Send, MessageCircle, ChevronLeft, X, Search, Loader2 } from "lucide-react";

export default function MessagingPanel({ currentUser, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const chatEnd = useRef(null);
  const searchTimer = useRef(null);

  const loadConversations = useCallback(async () => {
    if (!currentUser?._id) return;
    const res = await fetch(`${API_BASE_URL}/messages/conversations/${currentUser._id}`);
    const data = await res.json();
    if (data.success) setConversations(data.conversations);
    setLoading(false);
  }, [currentUser]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openChat = async (otherUser) => {
    if (!currentUser?._id) return;
    setActiveChat(otherUser);
    setSearchQuery("");
    setSearchResults([]);
    const res = await fetch(`${API_BASE_URL}/messages/${currentUser._id}/${otherUser._id}`);
    const data = await res.json();
    if (data.success) setMessages(data.messages);
    loadConversations();
  };

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !currentUser?._id || !activeChat) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId: currentUser._id, receiverId: activeChat._id, text: text.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setText("");
        loadConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const searchUsers = async (q) => {
    if (!q.trim() || !currentUser?._id) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API_BASE_URL}/messages/users/search?q=${encodeURIComponent(q)}&exclude=${currentUser._id}`);
      const data = await res.json();
      if (data.success) setSearchResults(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => searchUsers(val), 300);
  };

  const isActive = (userId) => activeChat?._id === userId;

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[500px] overflow-hidden rounded-[2rem] border border-gray-800 bg-[#0f1115]" dir="rtl">
      <div className={`w-full shrink-0 border-l border-gray-800 bg-[#1a1d23] md:w-72 lg:w-80 ${activeChat && "hidden md:block"}`}>
        <div className="border-b border-gray-800 p-3">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="جستجوی کاربر..."
              className="w-full rounded-2xl border border-gray-800 bg-[#0f1115] py-2.5 pr-9 pl-3 text-sm text-white outline-none focus:border-yellow-400"
            />
          </div>
          {searchQuery && (
            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
              {searching ? (
                <div className="flex justify-center py-3"><Loader2 size={16} className="animate-spin text-yellow-400" /></div>
              ) : searchResults.length === 0 ? (
                <p className="py-3 text-center text-xs text-gray-500">نتیجه‌ای یافت نشد</p>
              ) : searchResults.map((u) => (
                <button
                  key={u._id}
                  onClick={() => openChat(u)}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-right transition-all hover:bg-gray-800"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-xs font-black text-yellow-400">
                    {u.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">{u.name}</p>
                    <p className="truncate text-[10px] text-gray-500">{u.role === "Trainer" ? "مربی" : u.role === "Admin" ? "مدیر" : u.role === "Member" ? "ورزشکار" : u.role}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="overflow-y-auto" style={{ height: "calc(100% - 60px)" }}>
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-3 rounded-xl p-3">
                  <div className="h-9 w-9 rounded-xl bg-gray-800" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-24 rounded bg-gray-800" />
                    <div className="h-2 w-32 rounded bg-gray-800" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <MessageCircle size={32} className="mb-3 opacity-30" />
              <p className="text-sm font-black">مکالمه‌ای وجود ندارد</p>
              <p className="mt-1 text-xs">برای شروع گفتگو جستجو کنید</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.withUser?._id}
                onClick={() => openChat(conv.withUser)}
                className={`flex w-full items-center gap-3 border-b border-gray-800/50 p-3 text-right transition-all hover:bg-gray-800/50 ${isActive(conv.withUser?._id) ? "bg-yellow-400/5" : ""}`}
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-sm font-black text-yellow-400">
                  {conv.withUser?.name?.charAt(0) || "?"}
                  {conv.unread > 0 && (
                    <span className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                      {conv.unread > 9 ? "9+" : conv.unread}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{conv.withUser?.name || "حذف شده"}</p>
                  <p className="truncate text-xs text-gray-500">{conv.lastMessage?.text || ""}</p>
                </div>
                <span className="shrink-0 text-[10px] text-gray-600">
                  {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString("fa-IR", { month: "short", day: "numeric" }) : ""}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${!activeChat ? "hidden md:flex" : ""}`}>
        {activeChat ? (
          <>
            <div className="flex items-center gap-3 border-b border-gray-800 bg-[#1a1d23] p-3">
              <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400 hover:text-white"><ChevronLeft size={20} /></button>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-400/10 text-sm font-black text-yellow-400">
                {activeChat.name?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{activeChat.name}</p>
                <p className="text-[10px] text-gray-500">{activeChat.role === "Trainer" ? "مربی" : activeChat.role === "Admin" ? "مدیر" : activeChat.role === "Member" ? "ورزشکار" : activeChat.role}</p>
              </div>
              {onClose && (
                <button onClick={onClose} className="mr-auto text-gray-400 hover:text-white"><X size={18} /></button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <MessageCircle size={32} className="mb-3 opacity-30" />
                  <p className="text-sm font-black">هنوز پیامی ارسال نشده</p>
                  <p className="mt-1 text-xs">اولین پیام را ارسال کنید</p>
                </div>
              ) : messages.map((msg) => {
                const isMine = String(msg.senderId?._id) === String(currentUser?._id);
                return (
                  <div key={msg._id} className={`flex ${isMine ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${isMine ? "bg-yellow-400 text-black rounded-br-md" : "bg-gray-800 text-white rounded-bl-md"}`}>
                      <p>{msg.text}</p>
                      <p className={`mt-1 text-[10px] ${isMine ? "text-black/60" : "text-gray-500"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })}
                        {isMine && <span className="mr-2">{msg.read ? "✓✓" : "✓"}</span>}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEnd} />
            </div>
            <div className="border-t border-gray-800 bg-[#1a1d23] p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="پیام خود را بنویسید..."
                  className="flex-1 rounded-2xl border border-gray-800 bg-[#0f1115] px-4 py-2.5 text-sm text-white outline-none focus:border-yellow-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !text.trim()}
                  className="rounded-2xl bg-yellow-400 p-2.5 text-black transition-all hover:bg-yellow-500 disabled:opacity-50"
                >
                  {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-black">یک مکالمه را انتخاب کنید</p>
              <p className="mt-1 text-sm text-gray-600">از طریق جستجو یا لیست مکالمات</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
