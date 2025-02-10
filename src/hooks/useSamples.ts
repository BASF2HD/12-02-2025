
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Sample } from '../types';

export function useSamples() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchSamples();
  }, []);

  async function fetchSamples() {
    try {
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSamples(data || []);
    } catch (error) {
      console.error('Error fetching samples:', error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  async function addSamples(newSamples: Sample[]) {
    try {
      const { data, error } = await supabase
        .from('samples')
        .insert(newSamples)
        .select();

      if (error) throw error;
      setSamples(prevSamples => [...prevSamples, ...data]);
      return data;
    } catch (error) {
      console.error('Error adding samples:', error);
      throw error;
    }
  }

  async function deriveSamples(parentSamples: Sample[], derivedSamples: Sample[]) {
    try {
      const { data, error } = await supabase
        .from('samples')
        .insert(derivedSamples)
        .select();

      if (error) throw error;
      setSamples(prevSamples => [...prevSamples, ...data]);
      return data;
    } catch (error) {
      console.error('Error deriving samples:', error);
      throw error;
    }
  }

  return {
    samples,
    loading,
    error,
    addSamples,
    deriveSamples
  };
}
