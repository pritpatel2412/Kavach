// Mic -> 16 kHz mono PCM16 in exact 512-sample (1024-byte) frames with client-side silence gating (S3-A)
class Pcm16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;   // input samples per output sample
    this.pos = 0;                       // next output position in input coordinates (may be < 0)
    this.last = 0;                      // last sample of previous block
    this.buf = new Int16Array(512);
    this.n = 0;
    this.silenceThreshold = 250;        // ~ -42 dB RMS threshold for silence
    this.hangoverFrames = 15;           // ~480 ms hangover window to preserve word endings
    this.hangover = 0;
  }
  emit(v) {
    const s = Math.max(-1, Math.min(1, v));
    this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    if (this.n === 512) {
      // Calculate RMS for client-side silence gating (S3-A)
      let sumSq = 0;
      for (let i = 0; i < 512; i++) {
        const val = this.buf[i];
        sumSq += val * val;
      }
      const rms = Math.sqrt(sumSq / 512);
      const isSilent = rms < this.silenceThreshold;
      let shouldTransmit = false;
      if (!isSilent) {
        this.hangover = this.hangoverFrames;
        shouldTransmit = true;
      } else if (this.hangover > 0) {
        this.hangover--;
        shouldTransmit = true;
      }
      this.port.postMessage({
        buffer: this.buf.buffer.slice(0),
        shouldTransmit: shouldTransmit,
        isSilent: isSilent,
        rms: rms
      });
      this.n = 0;
    }
  }
  process(inputs) {
    const x = inputs[0][0];
    if (!x) return true;
    let p = this.pos;
    while (true) {
      if (p < 0) {
        const frac = p + 1;
        this.emit(this.last * (1 - frac) + x[0] * frac);
      } else {
        const i = Math.floor(p);
        if (i + 1 >= x.length) break;
        const frac = p - i;
        this.emit(x[i] * (1 - frac) + x[i + 1] * frac);
      }
      p += this.ratio;
    }
    this.pos = p - x.length;
    this.last = x[x.length - 1];
    return true;
  }
}
registerProcessor("pcm16k", Pcm16kProcessor);
