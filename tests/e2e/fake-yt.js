// Faux window.YT pour les tests e2e (aucun accès réseau à YouTube).
// Le temps vidéo avance RATE fois plus vite que le temps réel pour accélérer les tests.
(function () {
  const RATE = 4;
  const log = (window.__yt = { players: 0, calls: [], instance: null });
  function Player(target, opts) {
    const host = typeof target === 'string' ? document.getElementById(target) : target;
    const f = document.createElement('iframe');
    f.title = 'fake-yt';
    host.replaceWith(f);
    log.players++;
    log.instance = this;
    this.o = opts; this.vid = opts.videoId; this.t = opts.playerVars?.start || 0; this.s = -1; this.dur = 600;
    setTimeout(() => opts.events.onReady({ target: this }), 30);
  }
  const P = Player.prototype;
  P._set = function (s) { this.s = s; this.o.events.onStateChange?.({ data: s, target: this }); };
  P._tick = function () {
    clearInterval(this.iv);
    let last = performance.now();
    this.iv = setInterval(() => {
      if (this.s !== 1) return;
      const n = performance.now(); this.t += ((n - last) / 1000) * RATE; last = n;
      if (this.t >= this.dur) { this.t = this.dur; clearInterval(this.iv); this._set(0); }
    }, 4);
  };
  P.playVideo = function () {
    log.calls.push(['play', this.t]);
    if (this.s === 0) this.t = 0; // depuis « terminé », YouTube repart à 0
    setTimeout(() => this._set(3), 5);
    setTimeout(() => { this._set(1); this._tick(); }, 60);
  };
  P.pauseVideo = function () {
    log.calls.push(['pause', this.t]);
    clearInterval(this.iv);
    if (this.s === 1 || this.s === 3) this._set(2);
  };
  P.seekTo = function (t) { log.calls.push(['seek', t]); this.t = t; };
  P.cueVideoById = function (a) { log.calls.push(['cue', a.videoId, a.startSeconds]); this.vid = a.videoId; this.t = a.startSeconds || 0; clearInterval(this.iv); setTimeout(() => this._set(5), 5); };
  P.getCurrentTime = function () { return this.t; };
  P.getDuration = function () { return this.dur; };
  P.getPlayerState = function () { return this.s; };
  P.mute = P.unMute = P.unloadModule = P.setOption = function () {};
  P.setVolume = function () {};
  P.destroy = function () { clearInterval(this.iv); };
  P._error = function (code) { this.o.events.onError?.({ data: code, target: this }); };
  window.YT = { Player, PlayerState: { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } };
})();
