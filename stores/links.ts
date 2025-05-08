import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from '@/types/link';

interface LinksState {
  links: Link[];
  addLink: (link: Omit<Link, 'id' | 'createdAt'>) => void;
  removeLink: (id: string) => void;
  updateLink: (id: string, link: Partial<Link>) => void;
  getLink: (id: string) => Link | undefined;
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      links: [],
      addLink: (linkData) => {
        const link: Link = {
          ...linkData,
          id: Math.random().toString(36).slice(2),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ links: [link, ...state.links] }));
      },
      removeLink: (id) => {
        set((state) => ({
          links: state.links.filter((link) => link.id !== id),
        }));
      },
      updateLink: (id, updatedLink) => {
        set((state) => ({
          links: state.links.map((link) =>
            link.id === id ? { ...link, ...updatedLink } : link
          ),
        }));
      },
      getLink: (id) => {
        return get().links.find((link) => link.id === id);
      },
    }),
    {
      name: 'links-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);