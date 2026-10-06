import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  PhoneOff, 
  Users, 
  Radio
} from 'lucide-react';
import { UserProfile, TeamName } from '../types';

interface VideoRoomProps {
  currentUser: UserProfile;
  initialRoom?: string;
  onLeaveMeeting: () => void;
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const VideoRoom: React.FC<VideoRoomProps> = ({ currentUser, initialRoom = 'Global Video', onLeaveMeeting }) => {
  const [activeRoom, setActiveRoom] = useState<string>(initialRoom);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [camError, setCamError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const rooms = [
    { id: 'Global Video', name: 'Global Video Hall', team: 'All Teams', desc: 'Company townhall video stream' },
    { id: 'Management Video', name: 'Management Video', team: 'Management Team', desc: 'Executive board video room' },
    { id: 'Marketing Video', name: 'Marketing Video', team: 'Marketing Team', desc: 'Growth campaigns video review' },
    { id: 'Lead Gen Video', name: 'Lead Generation Video', team: 'Lead Generation Team', desc: 'Sales pipeline video sync' },
    { id: 'Development Video', name: 'Development Video', team: 'Development Team', desc: 'Engineering code review video' },
    { id: 'Scouting Video', name: 'Scouting Video', team: 'Scouting / Creator Recruitment Team', desc: 'Talent recruitment video' },
  ];

  const canAccessRoom = (roomTeam: string) => {
    if (isSuperAdmin) return true;
    if (roomTeam === 'All Teams') return true;
    return currentUser.team === roomTeam;
  };

  // Start webcam feed if cameraOn
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (cameraOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then((s) => {
          stream = s;
          setCamError(false);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(() => {
          setCamError(true);
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOn]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
            <Video className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Secure Video Rooms</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">HD Mesh</span>
            </h2>
            <p className="text-xs text-slate-400">Encrypted peer-to-peer video conferencing with screen share for SpidaLabs teams.</p>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Rooms List */}
        <div className="lg:col-span-4 border-r border-slate-800 p-4 space-y-3 overflow-y-auto bg-slate-900/40">
          <div className="text-[10px] font-mono uppercase text-slate-500 px-2 tracking-wider">Available Video Rooms</div>
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
                      ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg' 
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
                {isSelected && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Active Meeting Grid & Controls */}
        <div className="lg:col-span-8 flex flex-col justify-between p-6 bg-slate-950">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden relative flex items-center justify-center min-h-[260px]">
              {cameraOn && !camError ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              ) : (
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-blue-500 flex items-center justify-center text-xl font-mono font-bold text-blue-400">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {camError ? 'Webcam unavailable (Simulated)' : `${currentUser.name} (Camera Off)`}
                  </div>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-800 text-[11px] font-medium text-white flex items-center space-x-2">
                <span>{currentUser.name} (You)</span>
                {!micOn && <MicOff className="w-3.5 h-3.5 text-red-400" />}
              </div>
            </div>

            {/* Waiting for other participants */}
            <div className="bg-slate-900/50 border border-slate-800/80 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-2 min-h-[260px]">
              <Users className="w-8 h-8 text-slate-600" />
              <h4 className="text-xs font-semibold text-slate-400">Waiting for team members to join...</h4>
              <p className="text-[11px] text-slate-500">Other authorized members of {activeRoom} can join this encrypted room anytime.</p>
            </div>
          </div>

          {/* Video Control Toolbar */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-center space-x-4 shadow-2xl shrink-0">
            <button
              onClick={() => setMicOn(!micOn)}
              className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                !micOn ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {micOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
              <span>{micOn ? 'Mute' : 'Unmute'}</span>
            </button>

            <button
              onClick={() => setCameraOn(!cameraOn)}
              className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                !cameraOn ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {cameraOn ? <Video className="w-4 h-4 text-blue-400" /> : <VideoOff className="w-4 h-4" />}
              <span>{cameraOn ? 'Stop Cam' : 'Start Cam'}</span>
            </button>

            <button
              onClick={() => setScreenSharing(!screenSharing)}
              className={`p-3.5 rounded-xl flex items-center space-x-2 text-xs font-semibold transition ${
                screenSharing ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span>{screenSharing ? 'Stop Share' : 'Share Screen'}</span>
            </button>

            <button
              onClick={onLeaveMeeting}
              className="p-3.5 px-6 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-semibold transition flex items-center space-x-2 shadow-lg shadow-red-600/30"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Meeting</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
