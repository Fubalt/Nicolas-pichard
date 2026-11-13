import { CYPRIEN_QUOTES } from '@/data/quotes';
import { BobineMock, type MockQuote } from './mock';

const SCREENS = ['primitives', 'repliques', 'battle', 'etats', 'blindtest'] as const;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.ecran) ? sp.ecran[0] : sp.ecran;
  const ecran = (SCREENS as readonly string[]).includes(raw ?? '') ? (raw as (typeof SCREENS)[number]) : 'primitives';
  const q = CYPRIEN_QUOTES.find((x) => x.id === 'geeks_super_pouvoirs_voler') ?? CYPRIEN_QUOTES[0];
  const quote: MockQuote = {
    videoTitle: q.videoTitle,
    setupPhrase: q.setupPhrase,
    correctPunchline: q.correctPunchline,
    options: q.options,
    startTime: q.startTime,
    pauseTime: q.pauseTime,
  };
  const titles = Array.from(new Set(CYPRIEN_QUOTES.map((x) => x.videoTitle))).slice(0, 6);
  return <BobineMock ecran={ecran} quote={quote} titles={titles} />;
}
