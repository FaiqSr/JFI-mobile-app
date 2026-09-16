// @ts-nocheck
// Runnable self-check for src/utils/csPdf.ts. Node 22+ type-stripping, no test framework.
//   node --experimental-strip-types src/utils/csPdf.check.mjs
import assert from 'node:assert/strict';
import {
  buildCsPdfUrl,
  closeCsPdfViewer,
  csPdfCacheFileName,
  isCsPdfTaskId,
  isNonPdfContentType,
  openCsPdfViewer,
  subscribeToCsPdf,
} from './csPdf.ts';

// 1. Only positive integers are task ids (guards against the synthetic ids the
//    CS lists carry: 'session_7_2', '', undefined, 0, -1, 'abc').
assert.equal(isCsPdfTaskId(7), true);
assert.equal(isCsPdfTaskId('7'), true);
assert.equal(isCsPdfTaskId(' 12 '), true);
assert.equal(isCsPdfTaskId(0), false);
assert.equal(isCsPdfTaskId(-3), false);
assert.equal(isCsPdfTaskId('session_7_2'), false);
assert.equal(isCsPdfTaskId(''), false);
assert.equal(isCsPdfTaskId(undefined), false);
assert.equal(isCsPdfTaskId(null), false);
assert.equal(isCsPdfTaskId(1.5), false);

// 2. URL must be the same endpoint entry-web/dashboard hit, with no double slash
//    and no whitespace leaking in from a stored draft value. `base` is REQUIRED
//    (no default): this module must keep ZERO imports so plain node can run this
//    check at all — an extensionless `../api/apiConfig` import dies with
//    ERR_MODULE_NOT_FOUND, and a `.ts`-suffixed one breaks tsc (TS5097).
assert.equal(
  buildCsPdfUrl(7, 'https://jfi.faiqsr.my.id/api/cs'),
  'https://jfi.faiqsr.my.id/api/cs/tasks/7/cs'
);
assert.equal(
  buildCsPdfUrl(' 7 ', 'https://jfi.faiqsr.my.id/api/cs///'),
  'https://jfi.faiqsr.my.id/api/cs/tasks/7/cs'
);
assert.equal(
  buildCsPdfUrl(12, 'https://jfi.faiqsr.my.id/api/cs/'),
  'https://jfi.faiqsr.my.id/api/cs/tasks/12/cs'
);

// 3. One cache file per task, always the same name (never a shared/stale path).
assert.equal(csPdfCacheFileName(7), 'CS_WorkOrder_7.pdf');
assert.equal(csPdfCacheFileName(' 7 '), 'CS_WorkOrder_7.pdf');

// 4. Only POSITIVE evidence of a non-PDF body rejects the download: a DECLARED
//    content type that is not `application/pdf`. An unknown/absent type is
//    inconclusive and must not block a valid download.
assert.equal(isNonPdfContentType('application/pdf', undefined), false);
assert.equal(isNonPdfContentType(null, { 'content-type': 'application/pdf' }), false);
assert.equal(isNonPdfContentType(null, { 'Content-Type': 'application/pdf; charset=binary' }), false);
assert.equal(isNonPdfContentType(undefined, undefined), false);
assert.equal(isNonPdfContentType(null, {}), false);
assert.equal(isNonPdfContentType(null, { 'content-type': 'text/html' }), true);
assert.equal(isNonPdfContentType('text/html', undefined), true);
assert.equal(isNonPdfContentType('application/json', { 'content-type': 'application/json' }), true);

// 5. Viewer store (it lives in this same import-free module): opening emits the
//    request with the numeric task id and the file label.
const seen = [];
const unsubscribe = subscribeToCsPdf((request) => seen.push(request));
assert.equal(seen.at(-1), null, 'nothing open before the first open()');

assert.equal(openCsPdfViewer('12', 'CS-001.pdf'), true);
assert.equal(seen.at(-1).taskId, 12);
assert.equal(seen.at(-1).fileLabel, 'CS-001.pdf');

// 6. An invalid/synthetic id is refused and does NOT change the current state.
assert.equal(openCsPdfViewer('session_12_3'), false);
assert.equal(seen.at(-1).taskId, 12, 'a refused open must not emit');
assert.equal(openCsPdfViewer(undefined), false);
assert.equal(openCsPdfViewer(0), false);

// 7. A newer request replaces the old one and gets a new id, so the host
//    re-downloads instead of reusing the previous task's file.
const firstId = seen.at(-1).id;
assert.equal(openCsPdfViewer(15), true);
assert.equal(seen.at(-1).taskId, 15);
assert.notEqual(seen.at(-1).id, firstId);

// 8. Closing clears the store; a late subscriber is replayed the current state.
closeCsPdfViewer();
assert.equal(seen.at(-1), null);
const late = [];
const unsubscribeLate = subscribeToCsPdf((request) => late.push(request));
assert.equal(late.length, 1);
assert.equal(late.at(-1), null);
unsubscribeLate();
unsubscribe();

console.log('csPdf checks passed');
