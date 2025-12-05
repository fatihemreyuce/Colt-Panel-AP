import { createContext } from 'react';
import type { LoginContextType } from '../providers/login-state-provider';

export const LoginContext = createContext<LoginContextType | undefined>(
  undefined
);

