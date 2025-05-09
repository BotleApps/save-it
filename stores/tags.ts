import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TagsState {
  tags: string[];
  addTag: (tag: string) => void;
  addTags: (tags: string[]) => void;
}

export const useTagsStore = create<TagsState>()(
  persist(
    (set) => ({
      tags: [],
      addTag: (tag: string) => set((state) => ({
        tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag].sort()
      })),
      addTags: (newTags: string[]) => set((state) => ({
        tags: [...new Set([...state.tags, ...newTags])].sort()
      })),
    }),
    {
      name: 'tags-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
