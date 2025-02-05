import { useState, useEffect } from 'react';
import type { Sample } from '../types';

export function useSamples() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  async function addSamples(newSamples: Sample[]) {
    try {
      // Add IDs to new samples
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
      // Add IDs and ensure parent references
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

  return {
    samples,
    loading,
    error,
    addSamples,
    deriveSamples
  };
}