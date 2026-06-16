'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Select, SelectOption } from '../ui/select';

interface Cyclist {
  id: string;
  fullName: string | null;
  email: string;
  isAmbassador: boolean;
}

export interface CyclistSelectProps {
  value: string;
  onChange: (cyclistId: string) => void;
  className?: string;
}

export function CyclistSelect({ value, onChange, className }: CyclistSelectProps) {
  const [cyclists, setCyclists] = useState<Cyclist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCyclists();
  }, []);

  const loadCyclists = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cyclists');
      setCyclists(response.data);
      setError(null);
    } catch (err) {
      console.error('Error loading cyclists:', err);
      setError('Erreur lors du chargement des cyclistes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
        Chargement des cyclistes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-2 border border-red-300 rounded-md bg-red-50 text-red-600">
        {error}
      </div>
    );
  }

  const options: SelectOption[] = cyclists.map((cyclist) => ({
    value: cyclist.id,
    label: `${cyclist.fullName || cyclist.email}${cyclist.isAmbassador ? ' (déjà ambassadeur)' : ''}`,
  }));

  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Sélectionner un cycliste..."
      className={className}
    />
  );
}
