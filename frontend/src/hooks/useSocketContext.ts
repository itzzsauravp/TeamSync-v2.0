import { useContext } from "react";
import { SocketContext } from "@/contexts/SocketContext";

const useSocketContext = () => {
  return useContext(SocketContext);
};

export default useSocketContext;
