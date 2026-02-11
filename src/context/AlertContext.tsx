import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertModal, type AlertButton } from '../components/ui/AlertModal';

interface AlertContextType {
  showAlert: (
    message: string,
    title?: string,
    buttons?: AlertButton[],
    type?: 'info' | 'success' | 'error' | 'warning'
  ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState<string | undefined>();
  const [message, setMessage] = useState('');
  const [buttons, setButtons] = useState<AlertButton[]>([{ text: 'OK' }]);
  const [type, setType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  const showAlert = useCallback(
    (
      msg: string,
      ttl?: string,
      btns?: AlertButton[],
      alertType: 'info' | 'success' | 'error' | 'warning' = 'info'
    ) => {
      setMessage(msg);
      setTitle(ttl);
      setButtons(btns || [{ text: 'OK' }]);
      setType(alertType);
      setVisible(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AlertModal
        visible={visible}
        title={title}
        message={message}
        buttons={buttons}
        onClose={handleClose}
        type={type}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};
