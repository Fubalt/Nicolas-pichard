import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target output path
const OUTPUT_FILE = path.resolve(__dirname, '../data/cyprien-videos.json');

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function parseDurationToSeconds(timeStr) {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return parts[0] || 0;
}

function extractVideosFromPayload(data) {
  const list = [];

  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;

    if (obj.lockupViewModel) {
      const lvm = obj.lockupViewModel;
      const id = lvm.contentId;
      const title = lvm.metadata?.lockupMetadataViewModel?.title?.content;

      let timeStr = '';
      const jsonStr = JSON.stringify(lvm);
      const m = jsonStr.match(/"thumbnailBadgeViewModel":\{"text":"([^"]+)"/);
      if (m) {
        timeStr = m[1];
      }

      if (id && title) {
        list.push({
          id,
          title: decodeHtmlEntities(title),
          duration: parseDurationToSeconds(timeStr),
          timeStr,
        });
      }
    } else if (obj.videoRenderer) {
      const vr = obj.videoRenderer;
      const id = vr.videoId;
      const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText;
      const lengthText = vr.lengthText?.simpleText || '';
      const lengthSeconds = vr.lengthSeconds ? parseInt(vr.lengthSeconds, 10) : 0;
      const duration = lengthSeconds || parseDurationToSeconds(lengthText);

      if (id && title) {
        list.push({
          id,
          title: decodeHtmlEntities(title),
          duration,
          timeStr: lengthText,
        });
      }
    } else if (obj.playlistVideoRenderer) {
      const pvr = obj.playlistVideoRenderer;
      const id = pvr.videoId;
      const title = pvr.title?.runs?.[0]?.text || pvr.title?.simpleText;
      const lengthText = pvr.lengthText?.simpleText || '';
      const lengthSeconds = pvr.lengthSeconds ? parseInt(pvr.lengthSeconds, 10) : 0;
      const duration = lengthSeconds || parseDurationToSeconds(lengthText);

      if (id && title) {
        list.push({
          id,
          title: decodeHtmlEntities(title),
          duration,
          timeStr: lengthText,
        });
      }
    }

    for (const k of Object.keys(obj)) {
      traverse(obj[k]);
    }
  }

  traverse(data);
  return list;
}

async function fetchFromChannel() {
  console.log('Fetching entire 300+ videos catalog from Cyprien channel & playlists...');

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'fr-FR,fr;q=0.9',
  };

  const videoMap = new Map();

  // 1. Fetch channel videos tab
  const initialRes = await fetch('https://www.youtube.com/@cyprien/videos', { headers });
  if (!initialRes.ok) throw new Error(`Failed to load channel: ${initialRes.status}`);

  const html = await initialRes.text();
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  let token = html.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1];

  const initialMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s);
  if (initialMatch) {
    const initialData = JSON.parse(initialMatch[1]);
    for (const v of extractVideosFromPayload(initialData)) {
      videoMap.set(v.id, v);
    }
  }

  // Paginate channel videos tab
  while (token) {
    try {
      const postRes = await fetch(
        `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': headers['User-Agent'] },
          body: JSON.stringify({
            context: { client: { hl: 'fr', gl: 'FR', clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
            continuation: token,
          }),
        }
      );
      if (!postRes.ok) break;
      const postData = await postRes.json();
      for (const v of extractVideosFromPayload(postData)) {
        videoMap.set(v.id, v);
      }
      token = JSON.stringify(postData).match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1];
    } catch {
      break;
    }
  }

  // 2. Fetch full uploads playlist (UUyWqModMQlbIo8274Wh_ZsQ) which captures all 300+ uploads
  try {
    const plRes = await fetch('https://www.youtube.com/playlist?list=UUyWqModMQlbIo8274Wh_ZsQ', { headers });
    const plHtml = await plRes.text();
    let plToken = plHtml.match(/"continuationCommand":\{"token":"([^"]+)"/)?.[1];
    const plMatch = plHtml.match(/var ytInitialData = ({.*?});<\/script>/s);
    if (plMatch) {
      const plData = JSON.parse(plMatch[1]);
      for (const v of extractVideosFromPayload(plData)) {
        videoMap.set(v.id, v);
      }
    }

    if (plToken && apiKey) {
      const plPostRes = await fetch(
        `https://www.youtube.com/youtubei/v1/browse?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'User-Agent': headers['User-Agent'] },
          body: JSON.stringify({
            context: { client: { hl: 'fr', gl: 'FR', clientName: 'WEB', clientVersion: '2.20240101.00.00' } },
            continuation: plToken,
          }),
        }
      );
      if (plPostRes.ok) {
        const plPostData = await plPostRes.json();
        for (const v of extractVideosFromPayload(plPostData)) {
          videoMap.set(v.id, v);
        }
      }
    }
  } catch (e) {
    console.warn('Playlist fallback note:', e.message);
  }

  const allVideos = Array.from(videoMap.values());
  console.log(`Total unique uploads discovered on channel: ${allVideos.length}`);

  // Filtering:
  // 1. Exclude [AUDIO] podcast episodes
  // 2. duration > 60 seconds (strictly exclude Shorts)
  // 3. Exclude unavailable / deleted
  const filtered = allVideos
    .filter((v) => {
      if (!v.duration || v.duration <= 60) return false;
      const upper = v.title.toUpperCase();
      if (upper.includes('[AUDIO]')) return false;
      const lower = v.title.toLowerCase();
      if (lower.includes('[supprimée]') || lower.includes('[privée]')) return false;
      return true;
    })
    .map((v) => ({
      id: v.id,
      title: v.title,
      duration: v.duration,
      durationInSeconds: v.duration,
    }));

  console.log(`Filtered long-form videos (>60s, sans [AUDIO]) : ${filtered.length}`);

  const dir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  console.log(`Saved catalog to ${OUTPUT_FILE}`);
}

fetchFromChannel().catch((err) => {
  console.error('Fatal fetch error:', err);
  process.exit(1);
});
