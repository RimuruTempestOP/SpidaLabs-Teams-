import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Lock, 
  Mic, 
  Video, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  MessageSquare,
  Trash2
} from 'lucide-react';
import { UserProfile, TeamName, ChatMessage } from '../types';
import { db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from '../firebase';

interface TeamSpaceProps {
  currentUser: UserProfile;
  onJoinVoice: (team: TeamName) => void;
  onJoinVideo: (team: TeamName) => void;
}

const ALL_TEAMS: TeamName[] = [
  'Management Team',
  'Marketing Team',
  'Lead Generation Team',
  'Development Team',
  'Scouting / Creator Recruitment Team'
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const TeamSpace: React.FC<TeamSpaceProps> = ({ currentUser, onJoinVoice, onJoinVideo }) => {
  const isSuperAdmin = currentUser.role === 'Super Admin';
  const [selectedTeam, setSelectedTeam] = useState<TeamName>(
    isSuperAdmin ? 'Management Team' : currentUser.team
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isAuthorized = isSuperAdmin || currentUser.team === selectedTeam;

  useEffect(() => {
    if (!isAuthorized) return;

    const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        if (data.teamId === selectedTeam) {
          msgs.push({ ...data, id: docSnap.id });
        }
      });
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (error) => {
      console.error('Error fetching team messages:', error);
    });

    return () => unsubscribe();
  }, [selectedTeam, isAuthorized]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isAuthorized) return;

    try {
      const newMsg = {
        text: inputText.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.name,
        senderRole: currentUser.role,
        senderTeam: currentUser.team,
        senderAvatar: '',
        teamId: selectedTeam,
        createdAt: new Date().toISOString(),
        reactions: {},
        attachments: []
      };

      await addDoc(collection(db, 'messages'), newMsg);
      setInputText('');
    } catch (err) {
      console.error('Failed to send team message:', err);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', msgId));
    } catch (err) {
      console.error('Failed to delete team message:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white flex items-center space-x-2 flex-wrap">
              <span className="truncate">{selectedTeam}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">Strictly Private</span>
            </h2>
            <p className="text-xs text-slate-400 truncate">Encrypted private team space with dedicated chat, voice, and video.</p>
          </div>
        </div>

        {/* Quick Room Action Buttons & Team Selector */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {isSuperAdmin && (
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value as TeamName)}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
            >
              {ALL_TEAMS.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          )}

          {isAuthorized && (
            <>
              <button
                onClick={() => onJoinVoice(selectedTeam)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Voice Room</span>
              </button>
              <button
                onClick={() => onJoinVideo(selectedTeam)}
                className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-medium transition shadow-lg shadow-blue-600/20"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Meeting</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Strict Privacy Enforcement Guard */}
      {!isAuthorized ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-800/80 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-lg font-bold text-white">Access Denied (Strict Privacy Rule)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You are assigned to the <span className="text-slate-200 font-semibold">{currentUser.team}</span> team. Database Row-Level Security prohibits viewing or joining <span className="text-red-400 font-semibold">{selectedTeam}</span> communications.
            </p>
          </div>
          <button
            onClick={() => setSelectedTeam(currentUser.team)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition"
          >
            Return to My Team Space
          </button>
        </div>
      ) : (
        <>
          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600" />
                <p className="text-sm">No messages in {selectedTeam} yet. Start collaborating securely below!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.senderId === currentUser.uid;
                return (
                  <div key={msg.id} className="flex items-start space-x-3 group">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400 shrink-0 mt-0.5">
                      {getInitials(msg.senderName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{msg.senderName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{msg.senderRole}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>

                    {(isOwn || isSuperAdmin) && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition"
                        title="Delete Message"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
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
                placeholder={`Message #${selectedTeam.toLowerCase().replace(/[^a-z0-9]/g, '-')} as ${currentUser.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-indigo-600/20"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
