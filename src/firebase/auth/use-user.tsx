
'use client';

import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { useAuth, useFirestore } from '../provider';
import { useRouter, usePathname } from 'next/navigation';
import type { User as UserModel, Coach, Student } from '@/models';

type AuthState = 'LOADING' | 'UNAUTHENTICATED' | 'AUTHENTICATED_NO_PROFILE' | 'AUTHENTICATED_WITH_PROFILE';

export interface UseUserReturn {
  user: User | null;
  profile: UserModel | null;
  coachProfile: Coach | null;
  studentProfile: Student | null;
  loading: boolean;
  authState: AuthState;
  isAuthenticated: boolean;
  isCoach: boolean;
  isStudent: boolean;
  isAdmin: boolean;
}

export function useUser(): UseUserReturn {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserModel | null>(null);
  const [coachProfile, setCoachProfile] = useState<Coach | null>(null);
  const [studentProfile, setStudentProfile] = useState<Student | null>(null);
  const [authState, setAuthState] = useState<AuthState>('LOADING');

  const isRedirecting = useRef(false);

  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const userRef = doc(db, 'users', user.uid);
        
        const unsubscribeProfile = onSnapshot(userRef, (userDoc) => {
          let unsubscribeRole: Unsubscribe | undefined;

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setProfile(userData as UserModel);

            const checkRoleProfile = (role: 'student' | 'coach') => {
              const roleRef = doc(db, `${role}s`, user.uid);
              unsubscribeRole = onSnapshot(roleRef, (roleDoc) => {
                if (roleDoc.exists()) {
                  if (role === 'student') setStudentProfile(roleDoc.data() as Student);
                  if (role === 'coach') setCoachProfile(roleDoc.data() as Coach);
                  setAuthState('AUTHENTICATED_WITH_PROFILE');
                } else {
                  if (role === 'student') setStudentProfile(null);
                  if (role === 'coach') setCoachProfile(null);
                  setAuthState('AUTHENTICATED_NO_PROFILE');
                }
              }, (error) => {
                console.error(`Error on ${role} profile snapshot:`, error);
                setAuthState('UNAUTHENTICATED');
              });
            };

            if (userData.role === 'student' || userData.role === 'coach') {
              checkRoleProfile(userData.role);
            } else {
              setCoachProfile(null);
              setStudentProfile(null);
              setAuthState('AUTHENTICATED_WITH_PROFILE'); // For admin or other roles with no sub-profile
            }
          } else {
            // User is authenticated, but no profile document yet.
            // This happens briefly during Google Sign-In redirect.
            setProfile(null);
            setAuthState('AUTHENTICATED_NO_PROFILE');
          }

          return () => {
            if (unsubscribeRole) unsubscribeRole();
          };
        }, (error) => {
          console.error("Error on user profile snapshot:", error);
          setAuthState('UNAUTHENTICATED');
        });
        
        return () => unsubscribeProfile();
      } else {
        setUser(null);
        setProfile(null);
        setCoachProfile(null);
        setStudentProfile(null);
        setAuthState('UNAUTHENTICATED');
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  useEffect(() => {
    if (isRedirecting.current || authState === 'LOADING') return;

    const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/coach-login') || pathname.startsWith('/coach-signup');
    
    if (authState === 'AUTHENTICATED_NO_PROFILE' && profile) {
      isRedirecting.current = true;
      const onboadingUrl = profile.role === 'coach' ? '/coach-onboarding/step-1' : '/onboarding/step-1';
      router.push(onboadingUrl);
    } else if (authState === 'AUTHENTICATED_WITH_PROFILE' && isAuthPage) {
      isRedirecting.current = true;
      const dashboardUrl = profile?.role === 'coach' ? '/coach-dashboard' : '/dashboard';
      router.push(dashboardUrl);
    }
  }, [authState, profile, router, pathname]);

  return { 
    user, 
    profile, 
    coachProfile, 
    studentProfile, 
    loading: authState === 'LOADING',
    authState,
    isAuthenticated: authState === 'AUTHENTICATED_WITH_PROFILE' || authState === 'AUTHENTICATED_NO_PROFILE',
    isCoach: profile?.role === 'coach',
    isStudent: profile?.role === 'student',
    isAdmin: profile?.role === 'admin',
  };
}
