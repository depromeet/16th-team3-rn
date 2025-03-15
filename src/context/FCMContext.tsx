import React, {createContext, useContext, useState} from 'react';

type FCMContextType = {
  fcmToken: string | null;
  setFcmToken: (token: string) => void;
};

const FCMContext = createContext<FCMContextType | undefined>(undefined);

export const FCMProvider = ({children}: {children: React.ReactNode}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  return (
    <FCMContext.Provider value={{fcmToken, setFcmToken}}>
      {children}
    </FCMContext.Provider>
  );
};

export const useFCM = () => {
  const context = useContext(FCMContext);
  if (!context) {
    throw new Error('useFCM must be used within an FCMProvider');
  }
  return context;
};
