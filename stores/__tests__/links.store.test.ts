import { useLinksStore } from '../links';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act } from '@testing-library/react-native'; // Using @testing-library/react-native for act
import { Link } from '../../types/link';

// Helper to create link data with defaults for testing
const createTestLinkData = (overrides: Partial<Omit<Link, 'id' | 'createdAt'>> = {}): Omit<Link, 'id' | 'createdAt'> => ({
  url: 'http://example.com',
  title: 'Test Link',
  description: null,
  imageUrl: null,
  tags: [],
  category: null,
  status: 'unread',
  readingProgress: 0,
  estimatedReadTime: null,
  note: null,
  groups: [],
  prompt: null,
  summary: null,
  response: null,
  content: null,
  ...overrides,
});

// Helper to reset AsyncStorage mock
const resetAsyncStorageMock = () => {
  let store: Record<string, string> = {};
  (AsyncStorage.setItem as jest.Mock).mockImplementation((key: string, value: string) => {
    return new Promise((resolve) => {
      store[key] = value;
      resolve(null);
    });
  });
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
    return new Promise((resolve) => {
      resolve(store[key] || null);
    });
  });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation((key: string) => {
    return new Promise((resolve) => {
      delete store[key];
      resolve(null);
    });
  });
  (AsyncStorage.clear as jest.Mock).mockImplementation(() => {
    return new Promise((resolve) => {
      store = {};
      resolve(null);
    });
  });
  (AsyncStorage.getAllKeys as jest.Mock).mockImplementation(() => {
    return new Promise((resolve) => {
      resolve(Object.keys(store));
    });
  });
  (AsyncStorage.multiGet as jest.Mock).mockImplementation((keys: string[]) => {
    return new Promise((resolve) => {
      const result = keys.map((key: string) => [key, store[key] || null]);
      resolve(result);
    });
  });
  (AsyncStorage.multiSet as jest.Mock).mockImplementation((keyValuePairs: [string, string][]) => {
    return new Promise((resolve) => {
      keyValuePairs.forEach(([key, value]: [string, string]) => {
        store[key] = value;
      });
      resolve(null);
    });
  });
  (AsyncStorage.multiRemove as jest.Mock).mockImplementation((keys: string[]) => {
    return new Promise((resolve) => {
      keys.forEach((key: string) => {
        delete store[key];
      });
      resolve(null);
    });
  });
};


describe('useLinksStore - addLink', () => {
  beforeEach(async () => {
    // Reset Zustand store to initial state
    // The persist middleware also needs to be cleared.
    // Resetting the store by directly manipulating what persist would load.
    await act(async () => {
      useLinksStore.persist.clearStorage(); // Clears the persisted state
      // Manually reset the in-memory state to initial values
      useLinksStore.setState(useLinksStore.getInitialState(), true);
    });
    // Reset AsyncStorage mock's internal store
    resetAsyncStorageMock();
    // Clear all mocks to ensure no interference between tests
    jest.clearAllMocks();
  });

  // Test 1: Should add a new link with generated id and createdAt.
  it('should add a new link with generated id and createdAt', async () => {
    const newLinkData = createTestLinkData({ url: 'http://example.com', title: 'Example' });
    
    // Get initial state (optional, for clarity or specific checks)
    // const initialState = useLinksStore.getState();
    // expect(initialState.links.length).toBe(0);

    await act(async () => {
      useLinksStore.getState().addLink(newLinkData);
    });

    const updatedState = useLinksStore.getState();
    expect(updatedState.links.length).toBe(1);
    
    const addedLink = updatedState.links[0];
    expect(addedLink.url).toBe(newLinkData.url);
    expect(addedLink.title).toBe(newLinkData.title);
    expect(addedLink.id).toEqual(expect.any(String));
    expect(addedLink.id).not.toBe('');
    
    // Validate createdAt is a valid ISO date string
    expect(addedLink.createdAt).toEqual(expect.any(String));
    const date = new Date(addedLink.createdAt);
    expect(date.toISOString()).toBe(addedLink.createdAt);
  });

  // Test 2: Should add a new link to the beginning of the links array.
  it('should add a new link to the beginning of the links array', async () => {
    const firstLinkData = createTestLinkData({ url: 'http://first.com', title: 'First' });
    const secondLinkData = createTestLinkData({ url: 'http://second.com', title: 'Second' });

    // Add the first link
    await act(async () => {
      useLinksStore.getState().addLink(firstLinkData);
    });
    
    // Add the second link
    await act(async () => {
      useLinksStore.getState().addLink(secondLinkData);
    });

    const updatedState = useLinksStore.getState();
    expect(updatedState.links.length).toBe(2);
    
    // Assert that the second link added is now the first item
    expect(updatedState.links[0].url).toBe(secondLinkData.url);
    expect(updatedState.links[0].title).toBe(secondLinkData.title);
    
    expect(updatedState.links[1].url).toBe(firstLinkData.url);
    expect(updatedState.links[1].title).toBe(firstLinkData.title);
  });
});

describe('useLinksStore - removeLink', () => {
  beforeEach(async () => {
    // Reset Zustand store to initial state
    await act(async () => {
      useLinksStore.persist.clearStorage();
      useLinksStore.setState(useLinksStore.getInitialState(), true);
    });
    // Reset AsyncStorage mock's internal store
    resetAsyncStorageMock();
    jest.clearAllMocks();
  });

  // Test 1: Should remove an existing link by id.
  it('should remove an existing link by id', async () => {
    // Add two links
    const link1Data = createTestLinkData({ url: 'http://link1.com', title: 'Link 1' });
    const link2Data = createTestLinkData({ url: 'http://link2.com', title: 'Link 2' });
    let link1Id = '';

    await act(async () => {
      useLinksStore.getState().addLink(link1Data);
    });
    // Get the id of the first link added (it's at index 0 after adding)
    link1Id = useLinksStore.getState().links[0].id; 
    
    await act(async () => {
      useLinksStore.getState().addLink(link2Data);
    });
    
    const link2Id = useLinksStore.getState().links[0].id; // Link2 is now at index 0

    // At this point, link2 is at index 0, link1 is at index 1
    // We want to remove link1Id
    
    expect(useLinksStore.getState().links.length).toBe(2);

    await act(async () => {
      useLinksStore.getState().removeLink(link1Id);
    });

    const updatedState = useLinksStore.getState();
    expect(updatedState.links.length).toBe(1);
    expect(updatedState.links[0].id).toBe(link2Id); // The remaining link should be link2
    expect(updatedState.links[0].url).toBe(link2Data.url);
  });

  // Test 2: Should not change the store if trying to remove a non-existent link.
  it('should not change the store if trying to remove a non-existent link', async () => {
    const linkData = createTestLinkData({ url: 'http://example.com', title: 'Example' });
    await act(async () => {
      useLinksStore.getState().addLink(linkData);
    });

    const initialLinks = [...useLinksStore.getState().links]; // Shallow copy for comparison
    const initialLinksCount = initialLinks.length;
    expect(initialLinksCount).toBe(1);

    await act(async () => {
      useLinksStore.getState().removeLink('nonExistentId');
    });

    const updatedState = useLinksStore.getState();
    expect(updatedState.links.length).toBe(initialLinksCount);
    expect(updatedState.links).toEqual(initialLinks); // Ensure content is unchanged
  });
});

describe('useLinksStore - updateLink', () => {
  beforeEach(async () => {
    // Reset Zustand store to initial state
    await act(async () => {
      useLinksStore.persist.clearStorage();
      useLinksStore.setState(useLinksStore.getInitialState(), true);
    });
    // Reset AsyncStorage mock's internal store
    resetAsyncStorageMock();
    jest.clearAllMocks();
  });

  // Test 1: Should update properties of an existing link.
  it('should update properties of an existing link', async () => {
    const initialLinkData = createTestLinkData({ url: 'http://original.com', title: 'Original Title' });
    let linkId = '';

    await act(async () => {
      useLinksStore.getState().addLink(initialLinkData);
    });
    linkId = useLinksStore.getState().links[0].id;
    const originalLink = { ...useLinksStore.getState().links[0] }; // Copy for createdAt, id

    const updatedData = { title: 'Updated Title', url: 'http://updated.example.com' };

    await act(async () => {
      useLinksStore.getState().updateLink(linkId, updatedData);
    });

    const updatedState = useLinksStore.getState();
    const updatedLink = updatedState.getLink(linkId);

    expect(updatedLink).toBeDefined();
    expect(updatedLink?.title).toBe(updatedData.title);
    expect(updatedLink?.url).toBe(updatedData.url);
    expect(updatedLink?.id).toBe(originalLink.id); // Should not change
    expect(updatedLink?.createdAt).toBe(originalLink.createdAt); // Should not change
  });

  // Test 2: Should only update specified properties.
  it('should only update specified properties', async () => {
    const initialLinkData = createTestLinkData({ url: 'http://original-url.com', title: 'Original Title for Partial Update' });
    let linkId = '';

    await act(async () => {
      useLinksStore.getState().addLink(initialLinkData);
    });
    linkId = useLinksStore.getState().links[0].id;
    const originalLink = { ...useLinksStore.getState().links[0] };

    const partialUpdateData = { title: 'Only Title Updated' };

    await act(async () => {
      useLinksStore.getState().updateLink(linkId, partialUpdateData);
    });

    const updatedState = useLinksStore.getState();
    const updatedLink = updatedState.getLink(linkId);

    expect(updatedLink).toBeDefined();
    expect(updatedLink?.title).toBe(partialUpdateData.title);
    expect(updatedLink?.url).toBe(originalLink.url); // URL should remain unchanged
    expect(updatedLink?.id).toBe(originalLink.id);
    expect(updatedLink?.createdAt).toBe(originalLink.createdAt);
  });

  // Test 3: Should not change the store if trying to update a non-existent link.
  it('should not change the store if trying to update a non-existent link', async () => {
    const initialLinkData = createTestLinkData({ url: 'http://some-link.com', title: 'Some Link' });
    await act(async () => {
      useLinksStore.getState().addLink(initialLinkData);
    });

    const initialLinksState = [...useLinksStore.getState().links]; // Shallow copy

    await act(async () => {
      useLinksStore.getState().updateLink('nonExistentId', { title: 'New Title' });
    });

    const updatedState = useLinksStore.getState();
    expect(updatedState.links.length).toBe(initialLinksState.length);
    expect(updatedState.links).toEqual(initialLinksState); // Content should be identical
  });
});

describe('useLinksStore - getLink', () => {
  beforeEach(async () => {
    // Reset Zustand store to initial state
    await act(async () => {
      useLinksStore.persist.clearStorage();
      useLinksStore.setState(useLinksStore.getInitialState(), true);
    });
    // Reset AsyncStorage mock's internal store
    resetAsyncStorageMock();
    jest.clearAllMocks();
  });

  // Test 1: Should retrieve an existing link by id.
  it('should retrieve an existing link by id', async () => {
    const linkData1 = createTestLinkData({ url: 'http://link1.com', title: 'Link One' });
    const linkData2 = createTestLinkData({ url: 'http://link2.com', title: 'Link Two' });
    let id1 = '';
    let id2 = '';

    await act(async () => {
      useLinksStore.getState().addLink(linkData1);
    });
    // Since new links are added to the beginning, linkData1 is at index 0 initially
    id1 = useLinksStore.getState().links[0].id;

    await act(async () => {
      useLinksStore.getState().addLink(linkData2);
    });
    // Now linkData2 is at index 0, and linkData1 is at index 1
    id2 = useLinksStore.getState().links[0].id;
    // Correcting id1 as its position shifted
    id1 = useLinksStore.getState().links[1].id;


    const retrievedLink1 = useLinksStore.getState().getLink(id1);
    expect(retrievedLink1).toBeDefined();
    expect(retrievedLink1?.id).toBe(id1);
    expect(retrievedLink1?.url).toBe(linkData1.url);
    expect(retrievedLink1?.title).toBe(linkData1.title);

    const retrievedLink2 = useLinksStore.getState().getLink(id2);
    expect(retrievedLink2).toBeDefined();
    expect(retrievedLink2?.id).toBe(id2);
    expect(retrievedLink2?.url).toBe(linkData2.url);
    expect(retrievedLink2?.title).toBe(linkData2.title);
  });

  // Test 2: Should return undefined if trying to get a non-existent link.
  it('should return undefined if trying to get a non-existent link', async () => {
    const linkData = createTestLinkData({ url: 'http://exists.com', title: 'Existing Link' });
    await act(async () => {
      useLinksStore.getState().addLink(linkData);
    });

    const retrievedLink = useLinksStore.getState().getLink('nonExistentId');
    expect(retrievedLink).toBeUndefined();
  });
});
