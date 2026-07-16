import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

type Batch = { id: string; name: string; subject: string };
type Child = { id: string; name: string; email: string; batches: Batch[] };

type ChildContextType = {
  children: Child[];
  selectedChild: Child | null;
  setSelectedChild: (c: Child) => void;
  loading: boolean;
  refetch: () => void;
};

const ChildContext = createContext<ChildContextType | null>(null);

export const ChildProvider = ({ children: reactChildren }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [childList, setChildList] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChildren = async () => {
    if (!user || user.role !== 'parent') {
      setLoading(false);
      return;
    }
    try {
      const { data } = await axiosInstance.get('/users/my-children');
      setChildList(data.data);
      // Keep the current selection if it still exists (e.g. after refetch),
      // otherwise default to the first child.
      setSelectedChild((prev) => {
        if (prev) {
          const stillExists = data.data.find((c: Child) => c.id === prev.id);
          if (stillExists) return stillExists;
        }
        return data.data.length > 0 ? data.data[0] : null;
      });
    } catch (err) {
      console.error('Failed to load children', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <ChildContext.Provider
      value={{ children: childList, selectedChild, setSelectedChild, loading, refetch: fetchChildren }}
    >
      {reactChildren}
    </ChildContext.Provider>
  );
};

export const useChild = () => {
  const ctx = useContext(ChildContext);
  if (!ctx) throw new Error('useChild must be used within ChildProvider');
  return ctx;
};