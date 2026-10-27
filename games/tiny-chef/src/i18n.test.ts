import { expect, it } from 'vitest';
import { copy, languages } from './i18n';
it('provides a nonempty label for every supported locale',()=>{for(const l of languages)for(const key of Object.keys(copy.en) as (keyof typeof copy.en)[])expect(copy[l][key]?.trim()).toBeTruthy()});
