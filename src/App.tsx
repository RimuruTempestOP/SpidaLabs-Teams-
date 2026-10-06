/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  auth, 
  signInAnonymously,
  db,
  doc,
  setDoc
} from './firebase';
import { UserProfile, NavTab, TeamName } from './types';
import { AuthScreen } from './components/AuthScreen';
import { Sidebar } from './components/Sidebar';
import { GlobalChat } from './components/GlobalChat';
import { TeamSpace } from './components/TeamSpace';
import { VoiceRoom } from './components/VoiceRoom';
import { VideoRoom } from './components/VideoRoom';
import { MemberDirectory } from './components/MemberDirectory';
import { AdminPanel } from './components/AdminPanel';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('spidalabs_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<NavTab>('global-chat');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('spidalabs_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('spidalabs_current_user');
    }
  }, [currentUser]);

  const handleTeamSignIn = async (profile: UserProfile) => {
    try {
      let uid = profile.uid;
      try {
        const cred = await signInAnonymously(auth);
        if (cred.user) {
          uid = cred.user.uid;
        }
      } catch (authErr) {
        console.warn('Anonymous auth note:', authErr);
      }

      const updatedProfile = { ...profile, uid };
      await setDoc(doc(db, 'users', uid), updatedProfile, { merge: true });
      setCurrentUser(updatedProfile);
    } catch (err) {
      console.error('Sign-in persistence error:', err);
      setCurrentUser(profile);
    }
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    localStorage.removeItem('spidalabs_current_user');
  };

  if (!currentUser) {
    return (
      <AuthScreen 
        onTeamSignIn={handleTeamSignIn} 
      />
    );
  }

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSignOut={handleSignOut} 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {activeTab === 'global-chat' && <GlobalChat currentUser={currentUser} />}
        {activeTab === 'team-space' && (
          <TeamSpace 
            currentUser={currentUser} 
            onJoinVoice={() => setActiveTab('voice')} 
            onJoinVideo={() => setActiveTab('video')} 
          />
        )}
        {activeTab === 'voice' && (
          <VoiceRoom 
            currentUser={currentUser} 
            onLeaveCall={() => setActiveTab('team-space')} 
          />
        )}
        {activeTab === 'video' && (
          <VideoRoom 
            currentUser={currentUser} 
            onLeaveMeeting={() => setActiveTab('team-space')} 
          />
        )}
        {activeTab === 'members' && <MemberDirectory currentUser={currentUser} />}
        {activeTab === 'admin' && <AdminPanel currentUser={currentUser} />}
        {activeTab === 'settings' && <SettingsModal currentUser={currentUser} onSignOut={handleSignOut} />}
      </main>
    </div>
  );
}
