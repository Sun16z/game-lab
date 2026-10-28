import { describe, expect, it } from 'vitest';
import { languages } from './i18n';
import { feedback, orderCopy, friendName } from './order-copy';
import type { OrderResult } from './rules';
describe('order messages',()=>{
  it('explains every outcome in every supported language',()=>{
    const results:OrderResult[]=['correct','missing','extra','forbidden','position'];
    for(const lang of languages){
      expect(friendName[lang]).toBeTruthy();
      for(const result of results)expect(feedback(lang,result).length).toBeGreaterThan(4);
      expect(orderCopy[lang].any).toBeTruthy();expect(orderCopy[lang].ordered).toBeTruthy();expect(orderCopy[lang].avoid).toBeTruthy();
    }
  });
});
