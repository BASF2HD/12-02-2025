import React from 'react';
import { Droplets, FlaskRound as Flask, Microscope, FileText, Dna, Component, Goal as Vial, TestTube, DivideIcon as LucideIcon, Sun as Lung, Goal as BloodTube, FileStack, Layers, FlaskRound as Flask2 } from 'lucide-react';
import { Specimen } from '../types';

interface SampleIconProps {
  specimen: Specimen;
  className?: string;
}

const iconMap: Record<string, typeof LucideIcon> = {
  'blood': Droplets,
  'plasma': Droplets,
  'dna': Dna,
  'rna': Dna,
  'tissue': Lung,
  'slide': Microscope,
  'ffpe': FileStack,
  'fresh': Flask,
  'frozen': Vial,
  'buffy': Flask2,
  'he': Layers,
  'default': TestTube
};

export function SampleIcon({ specimen, className = 'h-4 w-4' }: SampleIconProps) {
  // Check for blood specimens first
  if (specimen.toLowerCase().includes('blood') || specimen.toLowerCase().includes('immunology')) {
    return <span className="text-base">🩸</span>;
  }
  
  const key = Object.keys(iconMap).find(k => specimen.toLowerCase().includes(k)) || 'default';
  const Icon = iconMap[key];
  return <Icon className={className} />;
}