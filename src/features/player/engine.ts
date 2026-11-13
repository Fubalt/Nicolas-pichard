/**
 * Moteur de lecture YouTube, sans dépendance à React.
 *
 * Décisions issues des essais de l'étape 1a (docs/YOUTUBE_CONSTRAINTS.md §6) :
 * - coupure sur le temps vidéo (getCurrentTime à chaque trame, puis pauseVideo) ;
 * - pas d'endSeconds (il fait passer le lecteur à « terminé » et survit au seekTo) ;
 * - un lecteur unique réutilisé : cueVideoById pour changer de vidéo, seekTo pour se placer ;
 * - le lecteur ne doit jamais rester à l'état « terminé » : s'il y arrive, on le recharge.
 *
 * Conformité (option A) : le lecteur reste visible, rien n'est superposé et aucun
 * pointer-events:none n'est appliqué. Les commandes du jeu sont placées autour du lecteur.
 */
import type { YTPlayerInstance } from '@/types/youtube';

export const YT_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type PlayerErrorKind = 'invalid' | 'html5' | 'unavailable' | 'embed_blocked' | 'unknown';

/** Codes d'erreur de l'IFrame API (onError). */
export function classifyPlayerError(code: number): PlayerErrorKind {
  switch (code) {
    case 2:
      return 'invalid';
    case 5:
      return 'html5';
    case 100:
      return 'unavailable';
    case 101:
    case 150:
    case 153:
      return 'embed_blocked';
    default:
      return 'unknown';
  }
}

let apiPromise: Promise<NonNullable<Window['YT']>> | null = null;

/** Charge l'IFrame API une seule fois pour toute l'application. */
export function loadYouTubeApi(): Promise<NonNullable<Window['YT']>> {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT?.Player) resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        apiPromise = null;
        reject(new Error('iframe_api load failed'));
      };
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}

export interface SegmentOptions {
  /** Position de départ (s). */
  from: number;
  /** Position de coupure sur le temps vidéo (s). `null` : pas de coupure. */
  cutAt: number | null;
  /** Durée nominale du segment, pour la progression et le filet de sécurité (s). */
  duration: number;
  /** Appelé une fois quand la coupure est atteinte (cutAt) ou la durée écoulée (cutAt=null). */
  onDone?: () => void;
}

export interface EngineCallbacks {
  onReady?: () => void;
  onPlayingChange?: (playing: boolean) => void;
  onProgress?: (ratio: number) => void;
  onError?: (kind: PlayerErrorKind, code: number) => void;
  /** Lecture lancée hors du jeu (clic dans le lecteur) alors qu'aucun segment n'est en cours. */
  onUnsolicitedPlay?: () => void;
}

const PLAYER_VARS = {
  autoplay: 0,
  controls: 0,
  disablekb: 1,
  fs: 0,
  rel: 0,
  playsinline: 1,
  iv_load_policy: 3,
  cc_load_policy: 0,
};

export class ClipEngine {
  private player: YTPlayerInstance | null = null;
  private ready = false;
  private destroyed = false;
  private videoId: string;
  private parkAt: number;
  private needsReload = false;
  private raf: number | null = null;
  private safety: ReturnType<typeof setTimeout> | null = null;
  private segment: (SegmentOptions & { done: boolean; elapsed: number; last: number }) | null = null;
  private volume = 100;
  private muted = false;
  private cb: EngineCallbacks;

  constructor(host: HTMLElement, videoId: string, parkAt: number, cb: EngineCallbacks = {}) {
    this.videoId = videoId;
    this.parkAt = parkAt;
    this.cb = cb;
    loadYouTubeApi()
      .then((YT) => {
        if (this.destroyed) return;
        const mount = document.createElement('div');
        mount.style.width = '100%';
        mount.style.height = '100%';
        host.replaceChildren(mount);
        this.player = new YT.Player(mount, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: { ...PLAYER_VARS, start: Math.floor(parkAt), origin: window.location.origin },
          events: {
            onReady: () => {
              if (this.destroyed) return;
              this.ready = true;
              this.applyVolume();
              this.cue(this.videoId, this.parkAt);
              this.cb.onReady?.();
            },
            onStateChange: (e) => this.handleState(e.data),
            onError: (e) => this.cb.onError?.(classifyPlayerError(e.data), e.data),
          },
        });
      })
      .catch(() => this.cb.onError?.('unknown', -1));
  }

  setCallbacks(cb: EngineCallbacks) {
    this.cb = cb;
  }

  isReady() {
    return this.ready;
  }

  /** Change de vidéo (ou se repositionne) sans lancer la lecture. */
  cue(videoId: string, startSeconds: number) {
    this.videoId = videoId;
    this.parkAt = startSeconds;
    this.stopLoop();
    this.segment = null;
    if (!this.ready || !this.player) return;
    try {
      if (this.player.cueVideoById) this.player.cueVideoById({ videoId, startSeconds });
      else this.player.seekTo(startSeconds, true);
      this.needsReload = false;
    } catch {}
  }

  setVolume(volume: number, muted: boolean) {
    this.volume = volume;
    this.muted = muted;
    this.applyVolume();
  }

  /** Joue un segment et coupe sur le temps vidéo. */
  play(opts: SegmentOptions) {
    if (!this.ready || !this.player) return;
    if (this.needsReload) this.cue(this.videoId, opts.from);
    this.stopLoop();
    this.segment = { ...opts, done: false, elapsed: 0, last: performance.now() };
    this.cb.onProgress?.(0);
    try {
      this.applyVolume();
      this.player.seekTo(opts.from, true);
      this.player.playVideo();
    } catch {}
    this.startLoop();
  }

  /** Reprend la lecture là où elle s'est arrêtée, sans segment (lecture libre). */
  resumeFree() {
    if (!this.ready || !this.player) return;
    if (this.needsReload) {
      this.cue(this.videoId, this.parkAt);
      return;
    }
    try {
      this.player.playVideo();
    } catch {}
  }

  /** Reprend le segment en cours après une pause. */
  resumeSegment() {
    if (!this.segment || this.segment.done) return false;
    this.segment.last = performance.now();
    try {
      this.player?.playVideo();
    } catch {}
    this.startLoop();
    return true;
  }

  pause() {
    this.stopLoop();
    try {
      this.player?.pauseVideo();
    } catch {}
  }

  /** Abandonne le segment en cours (sans appeler onDone) et met en pause. */
  stop() {
    this.segment = null;
    this.pause();
  }

  currentTime(): number {
    try {
      return this.player?.getCurrentTime() ?? 0;
    } catch {
      return 0;
    }
  }

  destroy() {
    this.destroyed = true;
    this.stopLoop();
    try {
      this.player?.destroy();
    } catch {}
    this.player = null;
  }

  // --- interne ---

  private applyVolume() {
    if (!this.player) return;
    try {
      if (this.muted) this.player.mute();
      else {
        this.player.unMute();
        this.player.setVolume(this.volume);
      }
    } catch {}
  }

  private handleState(state: number) {
    if (this.destroyed) return;
    if (state === YT_STATE.PLAYING) {
      this.cb.onPlayingChange?.(true);
      if (this.segment && !this.segment.done && this.raf == null) {
        // Reprise depuis le lecteur lui-même : la coupure reste surveillée.
        this.segment.last = performance.now();
        this.startLoop();
        return;
      }
      if (!this.segment || this.segment.done) {
        if (this.segment?.cutAt == null && this.segment?.done) return; // révélation qui continue
        this.cb.onUnsolicitedPlay?.();
      }
    } else if (state === YT_STATE.PAUSED) {
      this.cb.onPlayingChange?.(false);
    } else if (state === YT_STATE.ENDED) {
      // Ne jamais rester à « terminé » : rechargement au prochain play, et fin prématurée.
      this.needsReload = true;
      this.cb.onPlayingChange?.(false);
      this.finishSegment();
    }
  }

  private finishSegment() {
    const seg = this.segment;
    if (!seg || seg.done) return;
    seg.done = true;
    this.cb.onProgress?.(1);
    this.clearSafety();
    seg.onDone?.();
  }

  private startLoop() {
    const seg = this.segment;
    if (!seg) return;
    const tick = () => {
      this.raf = null;
      const s = this.segment;
      if (!s || !this.player || this.destroyed) return;
      let state: number;
      try {
        state = this.player.getPlayerState();
      } catch {
        return;
      }
      const now = performance.now();
      if (state === YT_STATE.PLAYING) {
        s.elapsed += (now - s.last) / 1000;
        if (!s.done) this.cb.onProgress?.(Math.min(1, s.elapsed / s.duration));
        if (s.cutAt != null && !s.done && this.currentTime() >= s.cutAt) {
          try {
            this.player.pauseVideo();
          } catch {}
          this.finishSegment();
          return;
        }
        if (s.cutAt == null && !s.done && s.elapsed >= s.duration) {
          this.finishSegment(); // la vidéo continue (révélation)
          return;
        }
      }
      s.last = now;
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);

    // Filet de sécurité si les trames sont suspendues (onglet en arrière-plan).
    if (seg.cutAt != null) {
      this.clearSafety();
      const ms = Math.ceil((seg.duration - seg.elapsed + 3.5) * 1000);
      this.safety = setTimeout(() => {
        if (this.segment === seg && !seg.done) {
          try {
            this.player?.pauseVideo();
          } catch {}
          this.finishSegment();
        }
      }, ms);
    }
  }

  private clearSafety() {
    if (this.safety) clearTimeout(this.safety);
    this.safety = null;
  }

  private stopLoop() {
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.clearSafety();
  }
}
