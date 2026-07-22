export const CASE_TAB_IDS = [
  'overview',
  'brief',
  'theory',
  'evidence',
  'network',
  'timeline',
  'notes',
  'chargesheet',
];

export function getRouteTab(search) {
  const tab = new URLSearchParams(search).get('tab');
  return CASE_TAB_IDS.includes(tab) ? tab : 'overview';
}

export function buildCaseWorkspaceSearch(search, tabId) {
  const params = new URLSearchParams(search);
  params.set('tab', CASE_TAB_IDS.includes(tabId) ? tabId : 'overview');
  return `?${params.toString()}`;
}
