import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  PhoneOff, 
  Users, 
  Radio
} from 'lucide-react';
import { UserProfile, TeamName } from '../types';

interface VoiceRoomProps {
  currentUser: UserProfile;
  initialRoom?: string;
  onLeaveCall: () => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const VoiceRoom: React.FC<VoiceRoomProps> = ({ currentUser, initialRoom = 'Global Voice', onLeaveCall }) => {
  const [activeRoom, setActiveRoom] = useState<string>(initialRoom);
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const rooms = [
    { id: 'Global Voice', name: 'Global Voice Room', team: 'All Teams', desc: 'Company-wide open audio channel' },
    { id: 'Management Voice', name: 'Management Voice', team: 'Management Team', desc: 'Executive sync & decisions' },
    { id: 'Marketing Voice', name: 'Marketing Voice', team: 'Marketing Team', desc: 'Growth & campaigns discussion' },
    { id: 'Lead Gen Voice', name: 'Lead Generation Voice', team: 'Lead Generation Team', desc: 'Pipeline & sales sync' },
    { id: 'Development Voice', name: 'Development Voice', team: 'Development Team', desc: 'Engineering architecture sync' },
    { id: 'Scouting Voice', name: 'Scouting Voice', team: 'Scouting / Creator Recruitment Team', desc: 'Talent & creator outreach' },
  ];

  const canAccessRoom = (roomTeam: string) => {
    if (isSuperAdmin) return true;
    if (roomTeam === 'All Teams') return true;
    return currentUser.team === roomTeam;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center">
            <Radio className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Secure Voice Rooms</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">HD Audio</span>
            </h2>
            <p className="text-xs text-slate-400">Low-latency crystal clear encrypted audio channels for SpidaLabs teams.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Rooms List */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 space-y-3 overflow-y-auto bg-slate-900/40">
          <div className="text-[10px] font-mono uppercase text-slate-500 px-2 tracking-wider">Available Audio Channels</div>
          {rooms.map((r) => {
            const allowed = canAccessRoom(r.team);
            const isSelected = activeRoom === r.id;

            return (
              <div
                key={r.id}
                onClick={() => allowed && setActiveRoom(r.id)}
                className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                  !allowed 
                    ? 'opacity-40 bg-slate-950/20 border-slate-800/50 cursor-not-allowed'
                    : isSelected 
                      ? 'bg-emerald-600/15 border-emerald-500 text-white shadow-lg' 
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800/80 cursor-pointer'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-xs font-semibold flex items-center space-x-2">
                    <span>{r.name}</span>
                    {!allowed && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 font-mono">Restricted</span>}
                  </div>
                  <div className="text-[11px] text-slate-400">{r.desc}</div>
                </div>
                {isSelected && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Active Room View & Controls */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 bg-slate-950">
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <span>Connected to: {activeRoom}</span>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Encrypted peer audio stream active.</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>1 Active Participant</span>
              </div>
            </div>

            {/* Grid of participants in call */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500 flex items-center justify-center text-lg font-mono font-bold text-emerald-400 shadow-xl">
                    {getInitials(currentUser.name)}
                  </div>
                  {speaking && <span className="absolute -inset-1 rounded-full border-2 border-emerald-400 animate-ping" />}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white">{currentUser.name} (You)</div>
                  <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{muted ? 'Muted' : 'Speaking...'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Action Controls Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-center space-x-4 shadow-2xl">
            <button
              onClick={() => setMuted(!muted)}
              className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                muted ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {muted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span>{muted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={() => setDeafened(!deafened)}
              className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                deafened ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Headphones className="w-4 h-4 text-blue-400" />
              <span>{deafened ? 'Undeafen' : 'Deafen'}</span>
            </button>

            <button
              onClick={onLeaveCall}
              className="p-3.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-red-600/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Voice Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
