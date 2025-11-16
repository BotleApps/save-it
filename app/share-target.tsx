import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function ShareTarget() {
  const router = useRouter();

  useEffect(() => {
    // Extract share data from FormData if available
    if (typeof window !== 'undefined' && 'FormData' in window) {
      const searchParams = new URLSearchParams(window.location.search);
      const url = searchParams.get('url') || '';
      const title = searchParams.get('title') || '';
      const text = searchParams.get('text') || '';

      // Redirect to new-link with the shared data
      router.replace({
        pathname: '/new-link',
        params: { url, title, text }
      });
    }
  }, [router]);

  return null;
}
