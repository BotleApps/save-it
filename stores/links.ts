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
  clearAllLinks: () => void;
  exportLinks: () => Link[];
  importLinks: (links: Link[]) => void;
}

// Generate a more robust unique ID
const generateId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timestamp}-${randomPart}`;
};

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      links: [],
      addLink: (linkData) => {
        const link: Link = {
          ...linkData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          content: null,
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
      clearAllLinks: () => {
        set({ links: [] });
      },
      exportLinks: () => {
        return get().links;
      },
      importLinks: (importedLinks) => {
        set((state) => {
          // Merge imported links, avoiding duplicates by URL
          const existingUrls = new Set(state.links.map(l => l.url));
          const newLinks = importedLinks.filter(l => !existingUrls.has(l.url));
          return { links: [...newLinks, ...state.links] };
        });
      },
    }),
    {
      name: 'links-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);