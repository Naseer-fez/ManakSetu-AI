import test from "node:test";
import assert from "node:assert";
import { encodeWav } from "../audio.utils.ts";

test("encodeWav creates valid RIFF and WAVE header with 16-bit PCM", () => {
  const sampleRate = 16000;
  const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
  const wavBuffer = encodeWav(samples, sampleRate);

  assert.ok(wavBuffer instanceof ArrayBuffer);
  // Header is 44 bytes + 5 samples * 2 bytes = 54 bytes
  assert.strictEqual(wavBuffer.byteLength, 44 + 5 * 2);

  const view = new DataView(wavBuffer);
  // Check "RIFF"
  const riff = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
  assert.strictEqual(riff, "RIFF");

  // Check "WAVE"
  const wave = String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11));
  assert.strictEqual(wave, "WAVE");

  // Check sample rate
  assert.strictEqual(view.getUint32(24, true), 16000);
});
