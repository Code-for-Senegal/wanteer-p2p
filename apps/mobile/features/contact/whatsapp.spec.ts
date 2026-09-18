import { buildContactMessage, buildShareText, buildWhatsAppUrl, toWaMeNumber } from './whatsapp';

describe('toWaMeNumber', () => {
  it('keeps digits only', () => {
    expect(toWaMeNumber('+221771234567')).toBe('221771234567');
  });
});

describe('buildWhatsAppUrl', () => {
  it('carries the message, encoded', () => {
    const url = buildWhatsAppUrl('+221771234567', 'Bonjour, je suis Aïssatou.');
    expect(url).toBe('https://wa.me/221771234567?text=Bonjour%2C%20je%20suis%20A%C3%AFssatou.');
  });
});

describe('buildContactMessage', () => {
  it('names the listing so the recipient can place the contact', () => {
    expect(buildContactMessage({ firstName: 'Aïssatou', listingTitle: 'Manuel de maths' })).toBe(
      'Bonjour, je suis Aïssatou. Je vous contacte pour votre annonce : Manuel de maths.',
    );
  });

  it('does not carry a phone number', () => {
    const message = buildContactMessage({ firstName: 'Aïssatou', listingTitle: 'Manuel' });
    expect(message).not.toMatch(/\d{6,}/);
  });
});

describe('buildShareText', () => {
  it('describes the listing without ever leaking a number', () => {
    const text = buildShareText({
      title: 'Manuel de maths 3e',
      badge: 'Gratuit / don',
      neighborhoodName: 'Parcelles Assainies',
    });

    expect(text).toContain('Manuel de maths 3e');
    expect(text).toContain('Parcelles Assainies');
    // The guard that matters: a shared listing must not be a phone directory.
    expect(text).not.toMatch(/\d{6,}/);
  });
});
