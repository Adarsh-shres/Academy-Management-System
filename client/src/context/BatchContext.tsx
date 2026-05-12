import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { Batch, BatchInput, BatchRow } from '../types/batch';
import { batchToRow, rowToBatch } from '../types/batch';

interface BatchContextValue {
  batches: Batch[];
  loading: boolean;
  error: string | null;
  getBatchById: (id: string) => Batch | undefined;
  addBatch: (data: BatchInput) => Promise<Batch>;
  updateBatch: (id: string, data: Partial<Batch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  assignStudentsToBatch: (id: string, studentIds: string[]) => Promise<void>;
  refreshBatches: () => Promise<void>;
}

const BatchContext = createContext<BatchContextValue | null>(null);

export function BatchProvider({ children }: { children: ReactNode }) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('batches')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('[BatchContext] Failed to load batches:', fetchError.message);
      setBatches([]);
      setError(fetchError.code === '42P01' ? 'Create the batches table to enable persistence.' : fetchError.message);
      setLoading(false);
      return;
    }

    const mappedBatches = ((data as BatchRow[]) ?? []).map(rowToBatch);
    setBatches(mappedBatches);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchBatches();
  }, [fetchBatches]);

  const getBatchById = useCallback(
    (id: string) => batches.find((batch) => batch.id === id),
    [batches],
  );

  const addBatch = useCallback(
    async (data: BatchInput): Promise<Batch> => {
      setError(null);

      const { data: row, error: insertError } = await supabase
        .from('batches')
        .insert([batchToRow(data)])
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        throw insertError;
      }

      const newBatch = rowToBatch(row as BatchRow);
      setBatches((prev) => [newBatch, ...prev]);
      return newBatch;
    },
    [],
  );

  const updateBatch = useCallback(
    async (id: string, data: Partial<Batch>) => {
      setError(null);

      const { error: updateError } = await supabase
        .from('batches')
        .update(batchToRow(data))
        .eq('id', id);

      if (updateError) {
        setError(updateError.message);
        throw updateError;
      }

      setBatches((prev) => prev.map((batch) => (batch.id === id ? { ...batch, ...data } : batch)));
    },
    [],
  );

  const deleteBatch = useCallback(
    async (id: string) => {
      setError(null);

      const { error: deleteError } = await supabase
        .from('batches')
        .delete()
        .eq('id', id);

      if (deleteError) {
        setError(deleteError.message);
        throw deleteError;
      }

      setBatches((prev) => prev.filter((batch) => batch.id !== id));
    },
    [],
  );

  const assignStudentsToBatch = useCallback(
    async (id: string, studentIds: string[]) => {
      const existingBatch = batches.find((batch) => batch.id === id);
      const nextStudentIds = Array.from(new Set(studentIds));

      if (!existingBatch) {
        return;
      }

      await updateBatch(id, { studentIds: nextStudentIds });
    },
    [batches, updateBatch],
  );

  return (
    <BatchContext.Provider
      value={{
        batches,
        loading,
        error,
        getBatchById,
        addBatch,
        updateBatch,
        deleteBatch,
        assignStudentsToBatch,
        refreshBatches: fetchBatches,
      }}
    >
      {children}
    </BatchContext.Provider>
  );
}

export function useBatches() {
  const ctx = useContext(BatchContext);
  if (!ctx) throw new Error('useBatches must be used within <BatchProvider>');
  return ctx;
}
