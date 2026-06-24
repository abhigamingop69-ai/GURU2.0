class AudioEngine {
  context: AudioContext | null = null;
  enabled = true;

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.context.currentTime);
      gain.gain.setValueAtTime(vol, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.start();
      osc.stop(this.context.currentTime + duration);
    } catch(e) {}
  }

  playPop() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.context.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.start();
      osc.stop(this.context.currentTime + 0.1);
    } catch(e) {}
  }
  
  playThud() {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.context) return;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, this.context.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, this.context.currentTime + 0.08);
      gain.gain.setValueAtTime(0.4, this.context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.context.destination);
      osc.start();
      osc.stop(this.context.currentTime + 0.08);
    } catch(e) {}
  }

  playSuccess() {
    this.playTone(659.25, 'sine', 0.15, 0.2); // E5
    setTimeout(() => this.playTone(880, 'sine', 0.4, 0.2), 100); // A5
  }

  playError() {
    this.playTone(300, 'sawtooth', 0.15, 0.1);
    setTimeout(() => this.playTone(200, 'sawtooth', 0.3, 0.1), 150);
  }

  playCapture() {
    this.playThud();
    setTimeout(() => this.playPop(), 40);
  }
  
  playFanfare() {
    this.playTone(523.25, 'square', 0.15, 0.1); // C5
    setTimeout(() => this.playTone(659.25, 'square', 0.15, 0.1), 150); // E5
    setTimeout(() => this.playTone(783.99, 'square', 0.15, 0.1), 300); // G5
    setTimeout(() => this.playTone(1046.50, 'square', 0.4, 0.1), 450); // C6
  }
}

export const audio = new AudioEngine();
