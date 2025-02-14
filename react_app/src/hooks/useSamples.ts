
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
      // Ensure both arrays have values
      if (!parentSamples?.length || !derivedSamples?.length) {
        throw new Error('Parent samples and derived samples are required');
      }

      const samplesWithIds = derivedSamples.map(sample => {
        const parentSample = parentSamples.find(p => p.barcode === sample.parentBarcode);
        if (!parentSample) {
          throw new Error('Parent sample not found');
        }

        return {
          ...sample,
          id: crypto.randomUUID(),
          patientId: parentSample.patientId,
          site: parentSample.site,
          timepoint: parentSample.timepoint
        };
      });

      setSamples(prevSamples => [...prevSamples, ...samplesWithIds]);
      return samplesWithIds;
    } catch (error) {
      console.error('Error deriving samples:', error);
      throw error;
    }
  }

  async function deleteSamples(sampleIds: string[]) {
    try {
      if (!Array.isArray(sampleIds) || sampleIds.length === 0) {
        throw new Error('No samples selected for deletion');
      }
      
      const storedSamples = localStorage.getItem(STORAGE_KEY);
      const currentSamples = storedSamples ? JSON.parse(storedSamples) : [];
      const updatedSamples = currentSamples.filter(sample => !sampleIds.includes(sample.id));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSamples));
      setSamples(updatedSamples);
      
      return updatedSamples;
    } catch (error) {
      console.error('Error deleting samples:', error);
      throw error;
    }
  }

  async function updateSample(updatedSample: Sample) {
    try {
      setSamples(prevSamples => 
        prevSamples.map(sample => 
          sample.id === updatedSample.id ? updatedSample : sample
        )
      );
      return updatedSample;
    } catch (error) {
      console.error('Error updating sample:', error);
      throw error;
    }
  }

  return {
    samples,
    loading,
    error,
    addSamples,
    deriveSamples,
    deleteSamples,
    updateSample
  };
}
