import { RootState } from "@/store/store";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import io, { Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  activeUsers: string[];
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const SocketContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const { isAuthenticated, user_id } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = io("http://localhost:3000", {
        query: {
          userId: user_id,
        },
      });
      setSocket(socketInstance);

      socketInstance.on("getActiveUsers", (users) => setActiveUsers(users));

      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user_id]);

  return (
    <SocketContext.Provider value={{ socket, activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

export { SocketContext };
