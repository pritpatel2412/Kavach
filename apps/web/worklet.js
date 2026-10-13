// Mic -> 16 kHz mono PCM16 in exact 512-sample (1024-byte) frames, as Prisma realtime requires.
class Pcm16kProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / 16000;   // input samples per output sample
    this.pos = 0;                       // next output position in input coordinates (may be < 0)
    this.last = 0;                      // last sample of previous block
    this.buf = new Int16Array(512);
    this.n = 0;
  }
  emit(v) {
    const s = Math.max(-1, Math.min(1, v));
    this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
    if (this.n === 512) {
      this.port.postMessage(this.buf.buffer.slice(0));
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
