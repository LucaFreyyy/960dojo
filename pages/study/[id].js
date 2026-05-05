import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function StudyRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    const raw = router.query.id;
    const id = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : '';
    if (!router.isReady || !id) return;
    router.replace(`/analysis?study=${encodeURIComponent(id)}`).catch(() => {});
  }, [router.isReady, router.query.id, router]);
  return null;
}

