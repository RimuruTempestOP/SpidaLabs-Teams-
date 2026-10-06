export type TeamName = 
  | 'Super Admin'
  | 'Management Team'
  | 'Marketing Team'
  | 'Lead Generation Team'
  | 'Development Team'
  | 'Scouting / Creator Recruitment Team';

export type UserRole = 'Super Admin' | 'Member';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  team: TeamName;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderTeam: string;
  senderAvatar: string;
  teamId: string; // 'global' or TeamName
  createdAt: string;
  reactions?: { [emoji: string]: string[] }; // emoji -> array of user uids
  attachments?: { type: 'image' | 'file'; url: string; name: string }[];
}

export interface VoiceParticipant {
  uid: string;
  name: string;
  avatar: string;
  team: string;
  muted: boolean;
  deafened: boolean;
  speaking: boolean;
}

export interface VideoParticipant {
  uid: string;
  name: string;
  avatar: string;
  team: string;
  micOn: boolean;
  cameraOn: boolean;
  screenSharing: boolean;
  speaking: boolean;
}

export type NavTab = 'global-chat' | 'team-space' | 'voice' | 'video' | 'members' | 'admin' | 'settings';
