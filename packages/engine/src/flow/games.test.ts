import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isPlayableGame, pickSurprise, PLAYABLE_GAMES } from './games.ts';

test('only the three live games are playable', () => {
  assert.deepEqual([...PLAYABLE_GAMES], ['block_stack', 'scribble', 'flappy']);
  assert.equal(isPlayableGame('block_stack'), true);
  assert.equal(isPlayableGame('color_match'), false);
  assert.equal(isPlayableGame(null), false);
});

test('pickSurprise always returns a live game', () => {
  for (let i = 0; i < 20; i++) {
    assert.equal(isPlayableGame(pickSurprise()), true);
  }
});

test('pickSurprise can skip the last ride', () => {
  for (let i = 0; i < 20; i++) {
    const picked = pickSurprise('scribble');
    assert.notEqual(picked, 'scribble');
    assert.equal(isPlayableGame(picked), true);
  }
});
