'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Select, SelectOption } from '../ui/select';

interface Tire {
  id: string;
  rangeName: string;
  webProductName: string;
  compatibleBikeTypes: string;
}

export interface TireAssignment {
  tireId: string;
  bikeType: string;
  testimonial: string;
}

export interface TireSelectorProps {
  assignments: TireAssignment[];
  onChange: (assignments: TireAssignment[]) => void;
}

const BIKE_TYPES = [
  { value: 'ROAD', label: 'Route' },
  { value: 'MTB', label: 'VTT' },
  { value: 'GRAVEL', label: 'Gravel' },
  { value: 'CYCLOCROSS', label: 'Cyclocross' },
  { value: 'COMMUTING_TOUR', label: 'Ville/Tourisme' },
];

export function TireSelector({ assignments, onChange }: TireSelectorProps) {
  const [tires, setTires] = useState<Tire[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTires();
  }, []);

  const loadTires = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tires');
      setTires(response.data.tires || []);
    } catch (err) {
      console.error('Error loading tires:', err);
    } finally {
      setLoading(false);
    }
  };

  const addAssignment = () => {
    onChange([
      ...assignments,
      {
        tireId: '',
        bikeType: '',
        testimonial: '',
      },
    ]);
  };

  const removeAssignment = (index: number) => {
    onChange(assignments.filter((_, i) => i !== index));
  };

  const updateAssignment = (index: number, field: keyof TireAssignment, value: string) => {
    const updated = [...assignments];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const tireOptions: SelectOption[] = tires.map((tire) => ({
    value: tire.id,
    label: `${tire.rangeName} - ${tire.webProductName}`,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Pneus et témoignages
        </label>
        <button
          type="button"
          onClick={addAssignment}
          className="px-3 py-1 text-sm bg-michelin-blue-dark text-white rounded-md hover:bg-michelin-blue-dark/90"
        >
          + Ajouter un pneu
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Chargement des pneus...</div>
      )}

      {assignments.length === 0 && !loading && (
        <div className="text-sm text-gray-500 italic">
          Aucun pneu assigné. Cliquez sur "Ajouter un pneu" pour commencer.
        </div>
      )}

      {assignments.map((assignment, index) => (
        <div key={index} className="border border-gray-300 rounded-md p-4 space-y-3 relative">
          <button
            type="button"
            onClick={() => removeAssignment(index)}
            className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold"
            title="Supprimer"
          >
            ×
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de vélo
            </label>
            <Select
              value={assignment.bikeType}
              onChange={(value) => updateAssignment(index, 'bikeType', value)}
              options={BIKE_TYPES}
              placeholder="Sélectionner un type..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pneu Michelin
            </label>
            <Select
              value={assignment.tireId}
              onChange={(value) => updateAssignment(index, 'tireId', value)}
              options={tireOptions}
              placeholder="Sélectionner un pneu..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Témoignage
            </label>
            <textarea
              value={assignment.testimonial}
              onChange={(e) => updateAssignment(index, 'testimonial', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Pourquoi l'ambassadeur utilise ce pneu..."
            />
          </div>
        </div>
      ))}
    </div>
  );
}
