import { slugify } from './categories.service';

describe('slugify', () => {
  it('strips diacritics and punctuation', () => {
    expect(slugify('Électroménager & Cuisine')).toBe('electromenager-cuisine');
  });

  it('collapses separators', () => {
    expect(slugify('  Livres   scolaires  ')).toBe('livres-scolaires');
  });
});
