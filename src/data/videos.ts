import cyprienVideosRaw from '../../data/cyprien-videos.json';
import { VideoItem, GameMode } from '@/types/game';

interface RawVideoItem {
  id: string;
  title: string;
  duration?: number;
  durationInSeconds?: number;
}

export const CYPRIEN_ALL_VIDEOS: VideoItem[] = (cyprienVideosRaw as RawVideoItem[]).map((v) => ({
  id: v.id,
  title: v.title,
  duration: v.duration ?? v.durationInSeconds ?? 0,
  durationInSeconds: v.durationInSeconds ?? v.duration ?? 0,
}));

// Backward compatibility alias
export const CYPRIEN_VIDEOS = CYPRIEN_ALL_VIDEOS;

// Classic slice: exactly from "CYPRIEN - LE DESSIN" (9 déc. 2016) to "Le McDonald's - Cyprien" (25 fév. 2010)
const DESSIN_INDEX = CYPRIEN_ALL_VIDEOS.findIndex((v) => v.id === 'bhK4UkmzAVA'); // index 106
const MCDO_INDEX = CYPRIEN_ALL_VIDEOS.findIndex((v) => v.id === '1-XJuqHB_t8'); // index 194

export const CYPRIEN_CLASSIC_VIDEOS: VideoItem[] = CYPRIEN_ALL_VIDEOS.slice(
  DESSIN_INDEX !== -1 ? DESSIN_INDEX : 106,
  (MCDO_INDEX !== -1 ? MCDO_INDEX : 194) + 1
);

let lastStartTime: number | null = null;
let lastVideoId: string | null = null;

export interface GetGameVideoOptions {
  mode?: GameMode;
  forceSameVideo?: boolean;
  fixedVideoId?: string;
}

/**
 * Picks a video according to the selected mode ('all' | 'classic')
 * and computes a valid random startTime (between 5s and duration - 35s).
 */
export function getRandomGameVideo(options?: GetGameVideoOptions | GameMode): { video: VideoItem; startTime: number } {
  const opts: GetGameVideoOptions = typeof options === 'string' ? { mode: options } : (options ?? {});
  const mode = opts.mode ?? 'all';
  const catalog = mode === 'classic' ? CYPRIEN_CLASSIC_VIDEOS : CYPRIEN_ALL_VIDEOS;

  let video: VideoItem;

  if (opts.fixedVideoId) {
    video = catalog.find((v) => v.id === opts.fixedVideoId) || catalog[0];
  } else if (opts.forceSameVideo && lastVideoId) {
    video = catalog.find((v) => v.id === lastVideoId) || catalog[0];
  } else {
    const index = Math.floor(Math.random() * catalog.length);
    video = catalog[index];
  }

  lastVideoId = video.id;

  // Ensure valid range
  const minStart = 5;
  const duration = video.durationInSeconds || video.duration || 300;
  const maxStart = Math.max(minStart, duration - 35);

  const range = maxStart - minStart;
  let startTime = Math.floor(minStart + Math.random() * range);

  // If same video is picked consecutively, ensure at least 30s distance
  if (lastStartTime !== null && lastVideoId === video.id && range > 60) {
    let attempts = 0;
    while (Math.abs(startTime - lastStartTime) < 30 && attempts < 20) {
      startTime = Math.floor(minStart + Math.random() * range);
      attempts++;
    }
  }

  lastStartTime = startTime;

  return {
    video,
    startTime,
  };
}
