// context/UserContext.tsx
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

type User = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  ageGroup: string;
  customerType: string;
  status: string;
  image: string;
  avatar?: string;
  role?: string;
};

type UserContextType = {
  user: User | null;
  reloadUser: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [user, setUser] = useState<User | null>(null);
  console.log(user);
  useEffect(() => {
    async function fetchUser() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/users/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchUser();
  }, [userId]);

  const reloadUser = () => {
    if (!userId) return;
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch(console.error);
  };

  return (
    <UserContext.Provider value={{ user, reloadUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used inside UserProvider");
  return context;
};
