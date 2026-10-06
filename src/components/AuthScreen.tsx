import React, { useState } from 'react';
import { Shield, Sparkles, LogIn, Users, Lock, CheckCircle2, KeyRound, Building2 } from 'lucide-react';
import { TeamName, UserRole, UserProfile } from '../types';

interface AuthScreenProps {
  onTeamSignIn: (profile: UserProfile) => void;
  error?: string | null;
}

const TEAM_PROFILES: { name: string; email: string; role: UserRole; team: TeamName; initials: string; password: string; desc: string }[] = [
  {
    name: 'Super Administrator',
    email: 'superadmin@spidalabs.io',
    role: 'Super Admin',
    team: 'Super Admin',
    initials: 'SA',
    password: 'SpidaAdmin2026!',
    desc: 'Full platform access, manages all teams & users.'
  },
  {
    name: 'Management Representative',
    email: 'management@spidalabs.io',
    role: 'Member',
    team: 'Management Team',
    initials: 'MG',
    password: 'SpidaMgmt2026!',
    desc: 'Company leadership & executive decision making.'
  },
  {
    name: 'Marketing Specialist',
    email: 'marketing@spidalabs.io',
    role: 'Member',
    team: 'Marketing Team',
    initials: 'MK',
    password: 'SpidaMkt2026!',
    desc: 'Growth campaigns, brand PR & global announcements.'
  },
  {
    name: 'Lead Generation Representative',
    email: 'leadgen@spidalabs.io',
    role: 'Member',
    team: 'Lead Generation Team',
    initials: 'LG',
    password: 'SpidaLead2026!',
    desc: 'Pipeline generation, enterprise sales & inbound qualification.'
  },
  {
    name: 'Development Engineer',
    email: 'dev@spidalabs.io',
    role: 'Member',
    team: 'Development Team',
    initials: 'DV',
    password: 'SpidaDev2026!',
    desc: 'Core architecture, cloud infrastructure & codebase.'
  },
  {
    name: 'Scouting Officer',
    email: 'scouting@spidalabs.io',
    role: 'Member',
    team: 'Scouting / Creator Recruitment Team',
    initials: 'SC',
    password: 'SpidaScout2026!',
    desc: 'Creator partnerships, talent acquisition & outreach.'
  }
];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onTeamSignIn }) => {
  const [selectedTeamProfile, setSelectedTeamProfile] = useState(TEAM_PROFILES[0]);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== selectedTeamProfile.password) {
      setLoginError(`Invalid password for ${selectedTeamProfile.team}. Please enter the correct department credentials.`);
      return;
    }

    onTeamSignIn({
      uid: `user_${selectedTeamProfile.email.split('@')[0]}`,
      email: selectedTeamProfile.email,
      name: selectedTeamProfile.name,
      role: selectedTeamProfile.role,
      team: selectedTeamProfile.team,
      avatar: '', // Clean abstract initials used instead of photo
      status: 'online',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* Left column: Branding & Info */}
        <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">SpidaLabs Teams</h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Secure Team Portal</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Strict team privacy.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                Encrypted Credentials.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              SpidaLabs Teams requires secure password authentication for each department and administrative role. Select your team and enter your team passphrase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-start space-x-3">
              <Lock className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Strict Isolation</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Team spaces are strictly partitioned.</p>
              </div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex items-start space-x-3">
              <Shield className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-xs font-semibold text-slate-200">Team Passphrases</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Secure credential verification.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Password Login Form */}
        <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-lg font-semibold text-white">Department Sign In</h3>
              <p className="text-xs text-slate-400 mt-1">Select your team or admin role and enter your secure password.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl">
                {loginError}
              </div>
            )}

            {/* Team Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">Select Team / Admin Role:</label>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {TEAM_PROFILES.map((p) => {
                  const isSelected = selectedTeamProfile.email === p.email;
                  return (
                    <div
                      key={p.email}
                      onClick={() => { setSelectedTeamProfile(p); setPasswordInput(''); setLoginError(null); }}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected 
                          ? 'bg-blue-600/15 border-blue-500 text-white' 
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-300 hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-blue-400">
                          {p.initials}
                        </div>
                        <div>
                          <div className="text-xs font-semibold flex items-center space-x-2">
                            <span>{p.team}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">{p.role}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">{p.desc}</div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Password Input (No auto-fill button) */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">Department Password:</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="Enter team password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm transition shadow-lg shadow-blue-600/25 flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In as {selectedTeamProfile.team}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
