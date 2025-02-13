
import { useState, useEffect } from 'react';
import type { Sample } from '../types';

const STORAGE_KEY = 'tracerx_samples';

export function useSamples() {
  const [samples, setSamples] = useState<Sample[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    setLoading(false);
  }, [samples]);

  async function addSamples(newSamples: Sample[]) {
    try {
      const samplesWithIds = newSamples.map(sample => ({
        ...sample,
        id: crypto.randomUUID()
      }));
      setSamples(prevSamples => [...prevSamples, ...samplesWithIds]);
      return samplesWithIds;
    } catch (error) {
      console.error('Error adding samples:', error);
      throw error;
    }
  }

  async function deriveSamples(parentSamples: Sample[], derivedSamples: Sample[]) {
    try {
      const samplesWithIds = derivedSamples.map((sample, index) => ({
        ...sample,
        id: crypto.randomUUID(),
        parentBarcode: parentSamples[index].barcode
      }));
      setSamples(prevSamples => [...prevSamples, ...samplesWithIds]);
      return samplesWithIds;
    } catch (error) {
      console.error('Error deriving samples:', error);
      throw error;
    }
  }

  async function deleteSamples(sampleIds: string[]) {
    try {
      setSamples(prevSamples => 
        prevSamples.filter(sample => !sampleIds.includes(sample.id))
      );
    } catch (error) {
      console.error('Error deleting samples:', error);
      throw error;
    }
  }

  return {
    samples,
    loading,
    error,
    addSamples,
    deriveSamples,
    deleteSamples
  };
}
