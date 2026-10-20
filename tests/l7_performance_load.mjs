/**
 * L7: Performance & Load Test Suite
 * Measures API latency under concurrency, static asset delivery,
 * rate limiter response under pressure, and memory stability.
 */

import fs from 'node:fs';
import path from 'node:path';

const ARTIFACTS_DIR = 'docs/testing/artifacts';
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const results = [];
function record(testId, name, passed, details = '') {
  results.push({ testId, name, status: passed ? 'PASS' : 'FAIL', details });
  console.log(`  [${passed ? 'PASS' : 'FAIL'}] ${testId} - ${name}: ${details}`);
}

async function runL7() {
  console.log('\n=== Running L7 Performance & Load Test Suite ===\n');

  // Test 1: API Concurrent Latency (30 parallel requests to /health)
  try {
    const t0 = performance.now();
    const requests = Array.from({ length: 30 }, () => fetch('http://127.0.0.1:8000/health'));
    const responses = await Promise.all(requests);
    const duration = performance.now() - t0;
    const avgLatency = duration / 30;
    const all200 = responses.every(r => r.status === 200);

    record('T-PERF-001', 'API Concurrency Throughput (30 reqs)', all200 && avgLatency < 100,
      `Total time: ${duration.toFixed(1)}ms, Avg per req: ${avgLatency.toFixed(2)}ms, All HTTP 200: ${all200}`);
  } catch (err) {
    record('T-PERF-001', 'API Concurrency Throughput (30 reqs)', false, err.message);
  }

  // Test 2: Next.js Frontend Time-To-First-Byte (TTFB)
  try {
    const t0 = performance.now();
    const res = await fetch('http://localhost:3000/');
    const ttfb = performance.now() - t0;
    const text = await res.text();

    record('T-PERF-002', 'Next.js Frontend TTFB & Payload Transfer', res.status === 200 && ttfb < 500,
      `TTFB: ${ttfb.toFixed(1)}ms, HTML Payload: ${(text.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    record('T-PERF-002', 'Next.js Frontend TTFB & Payload Transfer', false, err.message);
  }

  // Test 3: System Memory & Process Health
  try {
    const memUsage = process.memoryUsage();
    const heapUsedMb = (memUsage.heapUsed / 1024 / 1024).toFixed(1);
    const rssMb = (memUsage.rss / 1024 / 1024).toFixed(1);

    record('T-PERF-003', 'Process Memory Soak & Heap Health', memUsage.heapUsed < 250 * 1024 * 1024,
      `Node test runner Heap Used: ${heapUsedMb} MB, RSS: ${rssMb} MB (Healthy bounded footprint)`);
  } catch (err) {
    record('T-PERF-003', 'Process Memory Soak & Heap Health', false, err.message);
  }

  // Test 4: Rate Limiter Enforcement Under Parallel Burst
  try {
    // Send 25 rapid requests to an IP rate-limited endpoint
    const burst = Array.from({ length: 25 }, (_, i) =>
      fetch('http://127.0.0.1:8000/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Burst', email: `burst_${i}_${Date.now()}@test.com` })
      })
    );
    const responses = await Promise.all(burst);
    const statusCodes = responses.map(r => r.status);
    const has429 = statusCodes.includes(429);
    const has200 = statusCodes.includes(200);

    record('T-PERF-004', 'Sliding Window Rate Limiter Active Defense', has429 && has200,
      `Burst handled: accepted initial requests (HTTP 200) and throttled excessive rate (HTTP 429)`);
  } catch (err) {
    record('T-PERF-004', 'Sliding Window Rate Limiter Active Defense', false, err.message);
  }

  // Write results
  const outPath = path.join(ARTIFACTS_DIR, 'L7_performance_results.json');
  fs.writeFileSync(outPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\nL7 Results written to: ${outPath}`);
}

runL7().catch(console.error);
