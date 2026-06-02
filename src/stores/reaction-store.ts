'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ReactionType } from '@/types/review';

/** Local optimistic reactions — sync to API when backend is ready */
type ReactionState = {
  bySlug: Record<string, ReactionType | null>;
  setReaction: (slug: string, type: ReactionType | null) => void;
  getReaction: (slug: string) => ReactionType | null;
};

export const useReactionStore = create<ReactionState>()(
  persist(
    (set, get) => ({
      bySlug: {},
      setReaction: (slug, type) =>
        set((state) => ({
          bySlug: { ...state.bySlug, [slug]: type },
        })),
      getReaction: (slug) => get().bySlug[slug] ?? null,
    }),
    {
      name: 'techtalks-reactions',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ bySlug: state.bySlug }),
    },
  ),
);
