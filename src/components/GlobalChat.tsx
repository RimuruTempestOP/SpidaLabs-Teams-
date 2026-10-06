import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Search, 
  Smile, 
  Trash2, 
  Edit2, 
  MessageSquare, 
  Sparkles
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../types';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from '../firebase';

interface GlobalChatProps {
  currentUser: UserProfile;
}

const COMMON_EMOJIS = ['👍', '❤️', '🚀', '🔥', '💡', '🎉', '👀'];
const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const GlobalChat: React.FC<GlobalChatProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        if (data.teamId === 'global') {
          msgs.push({ ...data, id: docSnap.id });
        }
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error('Error fetching global messages:', error);
    });

    return () => unsubscribe();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const newMsg = {
        text: inputText.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderTeam: currentUser.team,
        senderAvatar: '',
        teamId: 'global',
        createdAt: new Date().toISOString(),
        reactions: {},
        attachments: []
      };

      await addDoc(collection(db, 'messages'), newMsg);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editText.trim()) return;
    try {
      await updateDoc(doc(db, 'messages', msgId), { text: editText.trim() });
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  };

  const handleToggleReaction = async (msg: ChatMessage, emoji: string) => {
    try {
      const reactions = { ...(msg.reactions || {}) };
      const users = reactions[emoji] || [];
      if (users.includes(currentUser.uid)) {
        reactions[emoji] = users.filter(id => id !== currentUser.uid);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, currentUser.uid];
      }
      await updateDoc(doc(db, 'messages', msg.id), { reactions });
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.senderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-blue-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 flex-wrap">
              <span className="truncate">Global Company Chat</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Public</span>
            </h2>
            <p className="text-xs text-slate-400 truncate">Company-wide announcements, updates, and open discussions.</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search global messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </header>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
            <Sparkles className="w-8 h-8 text-slate-600" />
            <p className="text-sm">No global messages found. Start the conversation below!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isOwn = msg.senderId === currentUser.uid;
            const isEditing = editingId === msg.id;

            return (
              <div key={msg.id} className="flex items-start space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400 shrink-0 mt-0.5">
                  {getInitials(msg.senderName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{msg.senderTeam}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-900 border border-blue-500 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                      />
                      <div className="flex space-x-2">
                        <button onClick={() => handleEditMessage(msg.id)} className="px-3 py-1 bg-blue-600 text-white text-[11px] rounded font-medium">Save</button>
                        <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-slate-800 text-slate-300 text-[11px] rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(msg.reactions).map(([emoji, uids]) => {
                        const hasReacted = uids.includes(currentUser.uid);
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleToggleReaction(msg, emoji)}
                            className={`px-2 py-0.5 rounded-full text-[11px] border flex items-center space-x-1 transition ${
                              hasReacted 
                                ? 'bg-blue-600/20 border-blue-500 text-blue-300' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="font-mono text-[10px]">{uids.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <div className="relative">
                    <button
                      onClick={() => setShowEmojiPickerFor(showEmojiPickerFor === msg.id ? null : msg.id)}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
                      title="Add Reaction"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>
                    {showEmojiPickerFor === msg.id && (
                      <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl p-2 flex space-x-1 shadow-xl z-20">
                        {COMMON_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => { handleToggleReaction(msg, emoji); setShowEmojiPickerFor(null); }}
                            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 rounded text-sm"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(isOwn || currentUser.role === 'Super Admin') && (
                    <>
                      {isOwn && (
                        <button
                          onClick={() => { setEditingId(msg.id); setEditText(msg.text); }}
                          className="p-1 text-slate-400 hover:text-blue-400 rounded hover:bg-slate-800 transition"
                          title="Edit Message"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            placeholder={`Message #global-chat as ${currentUser.name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-blue-600/20"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
