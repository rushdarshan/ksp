const BASE_URL = import.meta.env.VITE_API_URL || '/server';

const FUNCTIONS = [
  'fir_api', 'zia_voice', 'zia_brief', 'crime_chat', 'co_accused_network',
  'accused_at_large', 'chargesheet_clock', 'legal_rag', 'quickml_predict',
  'alert_job', 'veracity_index', 'topology_navigator', 'victim_risk_shield',
  'gbv_analytics', 'solvability_index', 'dark_figure', 'countercrime',
  'fir_quality', 'fairness_audit', 'case_management', 'agentic_police',
  'daily_brief', 'beat_optimizer', 'transit_detection', 'exceedance_curve',
  'precompute_job', 'predictive_mode'
];

let warmupPromise = null;
let isWarming = false;
let progressCallback = null;

export function registerWarmupProgress(cb) {
  progressCallback = cb;
}

export function startWarmup() {
  if (warmupPromise) return warmupPromise;

  isWarming = true;
  let completed = 0;

  // We warm up in parallel batches of 5 to avoid browser/network socket starvation.
  const batchSize = 6;
  const batches = [];
  
  for (let i = 0; i < FUNCTIONS.length; i += batchSize) {
    batches.push(FUNCTIONS.slice(i, i + batchSize));
  }

  warmupPromise = (async () => {
    for (const batch of batches) {
      await Promise.allSettled(
        batch.map(async (fnName) => {
          try {
            // We append ?warmup=1 to let the functions potentially bypass complex work
            await fetch(`${BASE_URL}/${fnName}/warmup?warmup=1`, {
              method: 'GET',
              headers: { 'X-Warmup': 'true' }
            });
          } catch (e) {
            // Warmup errors are ignored as long as the TCP request hit the Zoho gateway
          } finally {
            completed++;
            if (progressCallback) {
              progressCallback(Math.round((completed / FUNCTIONS.length) * 100));
            }
          }
        })
      );
    }
    isWarming = false;
    return true;
  })();

  return warmupPromise;
}

export function isWarmupActive() {
  return isWarming;
}
