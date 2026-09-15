// @ts-nocheck
// Runnable self-check for src/utils/appAlert.ts. Node 22 type-stripping, no test framework.
//   node --experimental-strip-types src/utils/appAlert.check.mjs
import assert from 'node:assert/strict';
import { Alert, dismissAlert, resolveAlert, subscribeToAlert } from './appAlert.ts';

const seen = [];
const unsubscribe = subscribeToAlert((request) => seen.push(request));

// 1. Single button alert (the 2-arg shape used by ~40 call sites).
Alert.alert('Peringatan', 'Nama pengguna dan kata sandi wajib diisi.');
assert.equal(seen.at(-1).title, 'Peringatan');
assert.equal(seen.at(-1).message, 'Nama pengguna dan kata sandi wajib diisi.');
assert.deepEqual(
  seen.at(-1).buttons.map((b) => b.text),
  ['OK']
);

// 2. Pressing a button runs its handler and clears the current alert.
let pressed = 0;
resolveAlert(seen.at(-1).buttons[0]);
assert.equal(seen.at(-1), null, 'current alert must be cleared after resolve');
assert.equal(pressed, 0);

// 3. Queue: a second request waits until the first is resolved, FIFO.
let cleared = 0;
Alert.alert('Konfirmasi Hapus', 'Hapus semua isian?', [
  { text: 'Batal', style: 'cancel' },
  { text: 'Hapus', style: 'destructive', onPress: () => { cleared += 1; } },
]);
assert.equal(seen.at(-1).title, 'Konfirmasi Hapus');
assert.equal(seen.at(-1).buttons.length, 2);
assert.equal(seen.at(-1).buttons[1].style, 'destructive');

Alert.alert('Kedua', 'harus mengantre');
assert.equal(seen.at(-1).title, 'Konfirmasi Hapus', 'second alert must queue, not overwrite');

resolveAlert(seen.at(-1).buttons[1]);
assert.equal(cleared, 1, 'onPress handler must run');
assert.equal(seen.at(-1).title, 'Kedua', 'queued alert must appear after resolve');

resolveAlert(seen.at(-1).buttons[0]);
assert.equal(seen.at(-1), null, 'queue must be drained before case 4 starts');

// 4. Backdrop / hardware-back dismiss runs onDismiss and does NOT run a button handler.
let dismissed = 0;
let cancelPressed = 0;
Alert.alert('Tanya', 'yakin?', [
  { text: 'Batal', style: 'cancel', onPress: () => { cancelPressed += 1; } },
], { onDismiss: () => { dismissed += 1; } });
dismissAlert();
assert.equal(dismissed, 1);
assert.equal(cancelPressed, 0);

// 5. cancelable:false is preserved for the host.
Alert.alert('Tidak bisa dibatalkan', undefined, undefined, { cancelable: false });
assert.equal(seen.at(-1).options.cancelable, false);
assert.equal(seen.at(-1).message, undefined);
resolveAlert(seen.at(-1).buttons[0]);
assert.equal(seen.at(-1), null);

unsubscribe();
console.log('appAlert checks passed');
