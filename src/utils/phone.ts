export const ARMENIA_PHONE_PREFIX = '+374';
const ARMENIA_COUNTRY_DIGITS = '374';
const ARMENIA_LOCAL_NUMBER_LENGTH = 8;

export const formatArmeniaPhoneInput = (input: string): string => {
  const digitsOnly = input.replace(/\D/g, '');
  let localDigits = digitsOnly;

  if (digitsOnly.startsWith(ARMENIA_COUNTRY_DIGITS)) {
    localDigits = digitsOnly.slice(ARMENIA_COUNTRY_DIGITS.length);
  } else if (digitsOnly.startsWith('0')) {
    localDigits = digitsOnly.slice(1);
  }

  return `${ARMENIA_PHONE_PREFIX}${localDigits.slice(0, ARMENIA_LOCAL_NUMBER_LENGTH)}`;
};

export const isValidArmeniaPhone = (phone: string): boolean =>
  new RegExp(`^\\${ARMENIA_PHONE_PREFIX}\\d{${ARMENIA_LOCAL_NUMBER_LENGTH}}$`).test(
    phone.trim(),
  );

export const isArmeniaPhonePrefixOnly = (phone: string): boolean =>
  phone.trim() === ARMENIA_PHONE_PREFIX;
