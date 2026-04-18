import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

function isUuidLike(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export default function TemplateRoutePage() {
  const router = useRouter();
  const raw = router.query.template;
  const template = Array.isArray(raw) ? raw[0] : raw;

  useEffect(() => {
    if (!router.isReady || !template) return;
    if (isUuidLike(template)) {
      router.replace(`/analysis?openingShare=${encodeURIComponent(template)}`).catch(() => {});
      return;
    }
    router.replace('/404').catch(() => {});
  }, [router, template]);

  return (
    <>
      <Head>
        <title>Opening Link - 960 Dojo</title>
      </Head>
      <main className="page-shell">
        <p>Loading opening...</p>
      </main>
    </>
  );
}