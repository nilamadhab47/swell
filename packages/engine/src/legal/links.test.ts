import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PLAY_STORE_URL, PRIVACY_URL, TERMS_URL } from './urls.ts';

test('legal and store URLs stay on the live site and Play listing', () => {
  assert.equal(PRIVACY_URL, 'https://www.useswell.site/privacy');
  assert.equal(TERMS_URL, 'https://www.useswell.site/terms');
  assert.match(PLAY_STORE_URL, /id=com\.swell\.quit$/);
});
