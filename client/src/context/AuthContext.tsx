import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserPersona } from '../types/judging';

export const DEMO_PERSONAS: UserPersona[] = [
  {
    id: 'demo-judge-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.judge@veyra.dev',
    role: 'judge',
    title: 'Lead AI & Systems Judge',
    avatar: '👩‍⚖️',
  },
  {
    id: 'demo-judge-2',
    name: 'Marcus Vance',
    email: 'marcus.judge@veyra.dev',
    role: 'judge',
    title: 'Product & Design Judge',
    avatar: '👨‍⚖️',
  },
  {
    id: 'demo-organizer',
    name: 'Alex Mercer',
    email: 'organizer@veyra.dev',
    role: 'organizer',
    title: 'Hackathon Director',
    avatar: '📋',
  },
  {
    id: 'demo-participant',
    name: 'Alex Rivera',
    email: 'alex.participant@veyra.dev',
    role: 'participant',
    title: 'Project Lead (EcoTrack)',
    avatar: '🚀',
  },
  {
    id: 'demo-admin',
    name: 'Root Administrator',
    email: 'root@veyra.dev',
    role: 'admin',
    title: 'Platform Superadmin',
    avatar: '🛡️',
  },
];

interface AuthContextType {
  currentUser: UserPersona;
  switchUser: (personaId: string) => void;
  personas: UserPersona[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserPersona>(() => {
    const savedId = localStorage.getItem('demo_user_id');
    const matched = DEMO_PERSONAS.find((p) => p.id === savedId);
    return matched || DEMO_PERSONAS[0];
  });

  useEffect(() => {
    localStorage.setItem('demo_user_id', currentUser.id);
    localStorage.setItem('demo_user_role', currentUser.role);
  }, [currentUser]);

  const switchUser = (personaId: string) => {
    const matched = DEMO_PERSONAS.find((p) => p.id === personaId);
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('demo_user_id', matched.id);
      localStorage.setItem('demo_user_role', matched.role);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, switchUser, personas: DEMO_PERSONAS }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
