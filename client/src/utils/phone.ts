import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

export interface CountryItem {
  country: string; // ISO 3166-1 alpha-2, e.g. 'IN', 'SE', 'US'
  code: string;    // International calling code, e.g. '+91', '+46', '+1'
  name: string;
}

export const countryCodes: CountryItem[] = [
  { country: 'IN', code: '+91', name: 'India' },
  { country: 'US', code: '+1', name: 'United States' },
  { country: 'GB', code: '+44', name: 'United Kingdom' },
  { country: 'SE', code: '+46', name: 'Sweden' },
  { country: 'CA', code: '+1', name: 'Canada' },
  { country: 'AU', code: '+61', name: 'Australia' },
  { country: 'DE', code: '+49', name: 'Germany' },
  { country: 'FR', code: '+33', name: 'France' },
  { country: 'ES', code: '+34', name: 'Spain' },
  { country: 'IT', code: '+39', name: 'Italy' },
  { country: 'JP', code: '+81', name: 'Japan' },
  { country: 'KR', code: '+82', name: 'South Korea' },
  { country: 'BR', code: '+55', name: 'Brazil' },
  { country: 'NL', code: '+31', name: 'Netherlands' },
  { country: 'SG', code: '+65', name: 'Singapore' },
  { country: 'AE', code: '+971', name: 'United Arab Emirates' },
  { country: 'MX', code: '+52', name: 'Mexico' },
  { country: 'CH', code: '+41', name: 'Switzerland' },
  { country: 'NZ', code: '+64', name: 'New Zealand' },
  { country: 'ZA', code: '+27', name: 'South Africa' },
  { country: 'NG', code: '+234', name: 'Nigeria' },
  { country: 'IE', code: '+353', name: 'Ireland' },
  { country: 'NO', code: '+47', name: 'Norway' },
  { country: 'DK', code: '+45', name: 'Denmark' },
  { country: 'FI', code: '+358', name: 'Finland' },
];

/**
 * Validates whether the given phone string has the exact valid length and format
 * for the given country using libphonenumber-js.
 *
 * @param phone The entered phone number
 * @param countryOrDialCode ISO alpha-2 country code (e.g., 'IN', 'SE') or dial code ('+91', '+46')
 */
export function isPhoneValidForCountry(phone: string, countryOrDialCode: string): boolean {
  if (!phone) return false;
  const cleanDigits = phone.replace(/[^\d+]/g, '');
  if (!cleanDigits) return false;

  let iso = countryOrDialCode.trim().toUpperCase();
  if (iso.startsWith('+')) {
    const found = countryCodes.find((c) => c.code === iso);
    if (found) {
      iso = found.country;
    }
  }

  try {
    const parsed = parsePhoneNumberFromString(cleanDigits, iso as CountryCode);
    return Boolean(parsed && parsed.isValid());
  } catch {
    return false;
  }
}

/**
 * Returns formatted calling code and number representation
 */
export function formatPhoneNumberDisplay(phone: string, countryOrDialCode: string): string {
  const clean = phone.replace(/\D/g, '');
  const found = countryCodes.find((c) => c.country === countryOrDialCode || c.code === countryOrDialCode);
  const code = found ? found.code : countryOrDialCode.startsWith('+') ? countryOrDialCode : `+${countryOrDialCode}`;
  return `${code} ${clean}`;
}
