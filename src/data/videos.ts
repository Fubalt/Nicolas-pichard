import cyprienVideosRaw from '../../data/cyprien-videos.json';
import { VideoItem } from '@/types/game';

export const CYPRIEN_VIDEOS: VideoItem[] = (cyprienVideosRaw as any[]).map((v) => ({
  id: v.id,
  title: v.title,
  duration: v.duration ?? v.durationInSeconds ?? 0,
  durationInSeconds: v.durationInSeconds ?? v.duration ?? 0,
}));

/**
 * Picks a random video from the catalog and computes a valid random startTime.
 * Requirement: startTime must be between 5 seconds and (duration - 35 seconds).
 */
export function getRandomGameVideo(): { video: VideoItem; startTime: number } {
  const index = Math.floor(Math.random() * CYPRIEN_VIDEOS.length);
  const video = CYPRIEN_VIDEOS[index];
  
  // Ensure valid range
  const minStart = 5;
  const maxStart = Math.max(minStart, video.durationInSeconds - 35);
  
  // Random integer second between minStart and maxStart
  const startTime = Math.floor(minStart + Math.random() * (maxStart - minStart));
  
  return {
    video,
    startTime
  };
}
