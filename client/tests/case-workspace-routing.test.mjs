import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCaseWorkspaceSearch,
  getRouteTab,
} from '../src/Components/CaseWorkspace/caseWorkspaceRouting.js';

test('reads supported case tabs from query parameters', () => {
  assert.equal(getRouteTab('?tab=evidence'), 'evidence');
  assert.equal(getRouteTab('?copilot=similar_cases&tab=network'), 'network');
});

test('falls back to overview for missing or unsupported tabs', () => {
  assert.equal(getRouteTab(''), 'overview');
  assert.equal(getRouteTab('?tab=unknown'), 'overview');
});

test('changes tabs without dropping the requested copilot action', () => {
  const search = buildCaseWorkspaceSearch('?tab=brief&copilot=evidence_gaps', 'evidence');
  assert.equal(search, '?tab=evidence&copilot=evidence_gaps');
});

test('normalizes invalid destination tabs', () => {
  assert.equal(buildCaseWorkspaceSearch('?copilot=explain', 'invalid'), '?copilot=explain&tab=overview');
});
