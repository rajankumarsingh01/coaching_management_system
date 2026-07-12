import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from './AuthContext';

type Batch = { _id: string; name: string; subject: string };

type BatchContextType = {
  batches: Batch[];
  selectedBatch: Batch | null;
  setSelectedBatch: (b: Batch) => void;
  loading: boolean;
};

const BatchContext = createContext<BatchContextType | null>(null);

export const BatchProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!user || (user.role !== 'teacher' && user.role !== 'student')) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get('/batches');
        setBatches(data.data);
        if (data.data.length > 0) setSelectedBatch(data.data[0]);
      } catch (err) {
        console.error('Failed to load batches', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, [user]);

  return (
    <BatchContext.Provider value={{ batches, selectedBatch, setSelectedBatch, loading }}>
      {children}
    </BatchContext.Provider>
  );
};

export const useBatch = () => {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatch must be used within BatchProvider');
  return ctx;
};