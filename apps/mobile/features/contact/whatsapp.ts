import { Linking } from 'react-native';

/**
 * The only module that touches a phone number.
 *
 * A number shown in clear invites scraping, cold calling and the Wave/Orange
 * Money scams that follow — and it exposes women first. Nothing here returns a
 * number for display: it goes into a URL and nowhere else.
 */
export function toWaMeNumber(e164: string): string {
  // wa.me wants digits only: no plus sign, no spaces.
  return e164.replace(/\D/g, '');
}

export function buildContactMessage(input: { firstName: string; listingTitle: string }): string {
  return `Bonjour, je suis ${input.firstName}. Je vous contacte pour votre annonce : ${input.listingTitle}.`;
}

export function buildWhatsAppUrl(e164: string, message: string): string {
  return `https://wa.me/${toWaMeNumber(e164)}?text=${encodeURIComponent(message)}`;
}

/** What gets pasted into a neighbourhood group. Never a phone number. */
export function buildShareText(input: {
  title: string;
  badge: string;
  neighborhoodName: string;
}): string {
  return `${input.title} — ${input.badge}\n${input.neighborhoodName}\nPartagé depuis P2P Local.`;
}

export async function openWhatsApp(url: string): Promise<boolean> {
  // Never probe with the whatsapp:// scheme: since Android 11 package
  // visibility makes canOpenURL answer false even when WhatsApp is installed.
  // An https://wa.me link always opens — WhatsApp catches it, the browser
  // takes over otherwise.
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
