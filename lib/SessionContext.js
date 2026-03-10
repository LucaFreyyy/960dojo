import { createContext, useContext } from 'react';

export const SessionContext = createContext({ session: null, loading: true });
export const useSupabaseSession = () => useContext(SessionContext).session;
export const useSessionLoading = () => useContext(SessionContext).loading;