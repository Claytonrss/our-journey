type PinPattern = {
  regex: RegExp;
  message: string;
};

export const PIN_PATTERNS: PinPattern[] = [
  { regex: /^\d9\d9$/, message: 'Errado! Sabia que você ia tentar a padrão.' },
  { regex: /^1\d{2}5$/, message: 'Erro :( É uma data mais específica.' },
  {
    regex: /^0\d{2}9$/,
    message: 'Errou! Não é o aniversário de uma pessoa.',
  },
  {
    regex: /^0\d{2}0$/,
    message: 'Nops... Tente de novo.',
  },
  {
    regex: /^(0000|1234|1111|9999|1212|2020|2026)$/,
    message: 'Sério? Essa é a primeira que todo mundo tenta.',
  },
];

export const RANDOM_ERRORS: string[] = [
  'Errou feio, errou rude.',
  'Tente outra vez...',
  'Essa não é a nossa data...',
  'Hmm... acho que não.',
  'Memória falhando?',
  'Não foi dessa vez.',
  'Ops! Continue tentando',
];

export function getPinErrorMessage(
  pin: string,
  patterns: PinPattern[],
): string {
  const matched = patterns.find((p) => p.regex.test(pin));
  if (matched) {
    return matched.message;
  }
  return RANDOM_ERRORS[Math.floor(Math.random() * RANDOM_ERRORS.length)];
}

export function isPinValid(pin: string): boolean {
  return /^\d{4}$/.test(pin);
}

export function buildPinFromDigits(
  currentPin: string,
  index: number,
  value: string,
): string {
  const newPin = currentPin.split('');
  newPin[index] = value;
  return newPin.join('').slice(0, 4);
}
