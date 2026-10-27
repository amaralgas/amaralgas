import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
const AuthContext = createContext<{user: User | null; ready: boolean}>({user:null,ready:false});
export const useCustomerAuth = () => useContext(AuthContext);
export function CustomerAuthProvider({children}: {children:ReactNode}) {
  const [user,setUser] = useState<User|null>(null);
  const [ready,setReady] = useState(false);
  const qc = useQueryClient(); const router = useRouter();
  useEffect(()=>{
    let active=true;
    supabase.auth.getUser().then(({data})=>{if(active){setUser(data.user);setReady(true);}});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;
      setUser(session?.user??null);setReady(true);
      router.invalidate();
      if(event!=='SIGNED_OUT')qc.invalidateQueries();
    });
    return ()=>{active=false;subscription.unsubscribe();};
  },[qc,router]);
  return <AuthContext.Provider value={{user,ready}}>{children}</AuthContext.Provider>;
}