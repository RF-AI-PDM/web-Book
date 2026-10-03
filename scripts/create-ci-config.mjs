import { writeFile } from 'node:fs/promises';

try {
  await writeFile('firebase-applet-config.json', JSON.stringify({
    projectId: 'demo-f15', appId: 'demo-f15', apiKey: 'demo-f15-ci-key',
    authDomain: 'demo-f15.firebaseapp.com', storageBucket: 'demo-f15.appspot.com', messagingSenderId: '1234567890',
  }, null, 2), { flag: 'wx' });
} catch (error) {
  if (error.code !== 'EEXIST') throw error;
}
