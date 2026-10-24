'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NEIGHBORS, SPIRITS } from '../data';
export interface Journal {
  name: string;
  neighborsHelped: string[];
  codexUnlocked: string[];
  lanternsLit: string[];
  notes: string;
  runs: number;
  audioMuted: boolean;
  motionEnabled: boolean;
  eggFound: boolean;
}
export const initialJournal: Journal = {
  name: 'Ari',
  neighborsHelped: [],
  codexUnlocked: [],
  lanternsLit: [],
  notes: '',
  runs: 0,
  audioMuted: false,
  motionEnabled: true,
  eggFound: false,
};
export function sanitizeJournal(value: unknown): Journal {
  if (!value || typeof value !== 'object') throw new Error('Invalid journal');
  const v = value as Record<string, unknown>;
  const ids = NEIGHBORS.map((n) => n.id);
  const names = SPIRITS.map((s) => s.id);
  const strings = (x: unknown, allowed: string[]) =>
    Array.isArray(x)
      ? [...new Set(x.filter((s): s is string => typeof s === 'string' && allowed.includes(s)))]
      : [];
  const helped = strings(v.neighborsHelped, ids);
  return {
    name: typeof v.name === 'string' ? v.name.slice(0, 32) : 'Ari',
    neighborsHelped: helped,
    lanternsLit: [...helped],
    codexUnlocked: [
      ...new Set([
        ...strings(v.codexUnlocked ?? v.collected, names),
        ...helped.map((id) => NEIGHBORS.find((n) => n.id === id)!.spirit),
      ]),
    ],
    notes: typeof v.notes === 'string' ? v.notes.slice(0, 10000) : '',
    runs: typeof v.runs === 'number' && Number.isSafeInteger(v.runs) && v.runs >= 0 ? v.runs : 0,
    audioMuted: v.audioMuted === true,
    motionEnabled: v.motionEnabled !== false,
    eggFound: v.eggFound === true,
  };
}
export function finishNeighbor(s: Journal, id: string): Journal {
  const n = NEIGHBORS.find((n) => n.id === id);
  if (!n) return s;
  return {
    ...s,
    neighborsHelped: [...new Set([...s.neighborsHelped, id])],
    lanternsLit: [...new Set([...s.lanternsLit, id])],
    codexUnlocked: [...new Set([...s.codexUnlocked, n.spirit])],
    runs: s.runs + 1,
  };
}
interface GameStore extends Journal {
  complete: (id: string) => void;
  patch: (data: Partial<Journal>) => void;
  restore: (data: unknown) => void;
  reset: () => void;
  demoAll: () => void;
}
export const useGame = create<GameStore>()(
  persist(
    (set) => ({
      ...initialJournal,
      complete: (id) => set((s) => finishNeighbor(s, id)),
      patch: (data) => set(data),
      restore: (data) => set(sanitizeJournal(data)),
      reset: () =>
        set({ ...initialJournal, neighborsHelped: [], lanternsLit: [], codexUnlocked: [] }),
      demoAll: () =>
        set((s) => ({
          ...s,
          neighborsHelped: NEIGHBORS.map((n) => n.id),
          lanternsLit: NEIGHBORS.map((n) => n.id),
          codexUnlocked: SPIRITS.map((n) => n.id),
        })),
    }),
    {
      name: 'hantu-codex-v2',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      merge: (stored, current) => ({ ...current, ...sanitizeJournal(stored) }),
    },
  ),
);
