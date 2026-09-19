import cyprienVideosRaw from '../../data/cyprien-videos.json';
import { VideoItem } from '@/types/game';

export const CYPRIEN_VIDEOS: VideoItem[] = (cyprienVideosRaw as any[]).map((v) => ({
  id: v.id,
  title: v.title,
  duration: v.duration ?? v.durationInSeconds ?? 0,
  durationInSeconds: v.durationInSeconds ?? v.duration ?? 0,
}));

let lastStartTime: number | null = null;
let lastVideoId: string | null = null;

export interface GetGameVideoOptions {
  forceSameVideo?: boolean;
  fixedVideoId?: string;
}

/**
 * Picks a video and computes a valid random startTime.
 * Requirement: startTime must be between 5 seconds and (duration - 35 seconds).
 * When testing with the same video, ensures the new timecode is noticeably different.
 */
export function getRandomGameVideo(options?: GetGameVideoOptions): { video: VideoItem; startTime: number } {
  let video: VideoItem;

  if (options?.fixedVideoId) {
    video = CYPRIEN_VIDEOS.find((v) => v.id === options.fixedVideoId) || CYPRIEN_VIDEOS[0];
  } else if (options?.forceSameVideo) {
    // If a previous video was selected, keep it; otherwise default to the first catalog video
    if (lastVideoId) {
      video = CYPRIEN_VIDEOS.find((v) => v.id === lastVideoId) || CYPRIEN_VIDEOS[0];
    } else {
      video = CYPRIEN_VIDEOS[0];
    }
  } else {
    const index = Math.floor(Math.random() * CYPRIEN_VIDEOS.length);
    video = CYPRIEN_VIDEOS[index];
  }

  lastVideoId = video.id;

  // Ensure valid range
  const minStart = 5;
  const duration = video.durationInSeconds || video.duration || 300;
  const maxStart = Math.max(minStart, duration - 35);

  const range = maxStart - minStart;
  let startTime = Math.floor(minStart + Math.random() * range);

  // When re-rolling on the same video, ensure at least 30s distance if range permits
  if (lastStartTime !== null && range > 60) {
    let attempts = 0;
    while (Math.abs(startTime - lastStartTime) < 30 && attempts < 20) {
      startTime = Math.floor(minStart + Math.random() * range);
      attempts++;
    }
  }

  lastStartTime = startTime;

  if (typeof window !== 'undefined') {
    const mins = Math.floor(startTime / 60);
    const secs = startTime % 60;
    console.log(
      `🎲 [Game Init] Vidéo: "${video.title}" | Timecode: ${startTime}s (${mins}m${secs.toString().padStart(2, '0')}s) / ${duration}s`
    );
  }

  return {
    video,
    startTime,
  };
}
