import { Socket, io } from 'socket.io-client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useHomeStore, useUserStore } from 'store';
import * as mapEnv from 'constants/map-env';
import { TSocketOnlineUser, TSocketReceiveMessage } from 'types';
import { toast } from 'react-toastify';

type TWebsocketContextProps = {
  sendMessage?: any;
};

type TProps = {
  children?: React.ReactNode;
};

const WebsocketContext = createContext<TWebsocketContextProps>({});

export const WebsocketProvider = ({ children }: TProps) => {
  const [userName, userInfo, setUserInfo] = useUserStore((state) => [
    state.userName,
    state.userInfo,
    state.setUserInfo,
  ]);
  const [selectedUser, setUserList, chatHistory, setChatHistory, resetChat] =
    useHomeStore((state) => [
      state.selectedUser,
      state.setUserList,
      state.chatHistory,
      state.setChatHistory,
      state.resetChat,
    ]);

  const [socketIo, setSocketIo] = useState<Socket>();

  const sendMessage = (
    receiverId: string,
    username: string,
    message: string
  ) => {
    socketIo?.emit('message:send', {
      receiver: { id: receiverId, username },
      message,
    });
  };

  useEffect(() => {
    if (userName && mapEnv.BASE_URL && !socketIo) {
      const socket = io(mapEnv.BASE_URL, {
         
      });

      setSocketIo(socket);
      socket.on('connect', () => socket.emit('user:login', userName));
      socket.on('disconnect', (msg) => {
        toast.error('Socketio disconnected!');
      });

      if (!userName && !!socket) {
        socket.disconnect();
      }
    }

    return () => {
      socketIo && socketIo.disconnect();
    };
  }, [userName]);

  useEffect(() => {
    socketIo?.on('usersOnline', (msg: TSocketOnlineUser) => {
      if (msg.data) {
        const userInfo = msg.data.find((f) => f.username === userName);
        setUserInfo(userInfo);
        setUserList(msg.data);
      }
    });
    socketIo?.on('error', (error) => {
      toast.error(error.message);

      if (error.event === 'message:send') {
        resetChat();
      }
    });
  }, [socketIo, userName]);

  useEffect(() => {
    if (selectedUser?.id && userInfo?.id) {
      socketIo?.on('message:receive', (data: TSocketReceiveMessage) => {
        const partnerId = [data.data.sender.id, data.data.receiver.id];
        if (
          partnerId.includes(selectedUser.id) &&
          partnerId.includes(userInfo.id)
        ) {
          setChatHistory([...chatHistory, data.data]);
        }
      });
    }
  }, [chatHistory, socketIo, selectedUser?.id, userInfo?.id]);

  return (
    <WebsocketContext.Provider
      value={{
        sendMessage,
      }}
    >
      {children}
    </WebsocketContext.Provider>
  );
};

export const useWebsocket = () => {
  return useContext(WebsocketContext);
};
