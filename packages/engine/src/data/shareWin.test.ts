import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shareWinMessage } from './shareWin.ts';

describe('shareWinMessage', () => {
  it('names the week and days without sounding medical', () => {
    const text = shareWinMessage({ beatenThisWeek: 4, daysClear: 12 });
    assert.match(text, /4 cravings this week/);
    assert.match(text, /12 days clear/);
    assert.match(text, /three minutes, then it was gone/);
    assert.match(text, /play\.google\.com\/store\/apps\/details\?id=com\.swell\.quit/);
    assert.doesNotMatch(text, /medical|doctor|treatment|cure/i);
  });

  it('uses singular copy for a first win', () => {
    const text = shareWinMessage({ beatenThisWeek: 1, daysClear: 1, brand: 'Swell' });
    assert.match(text, /1 craving this week/);
    assert.match(text, /1 day clear/);
    assert.match(text, /I rode it out with Swell/);
  });
});
