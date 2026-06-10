'use server';

import { getPinEnv } from '@/lib/env';

export async function validatePin(pin: string): Promise<boolean> {
  const { SECRET_PIN } = getPinEnv();

  // Prevenção de timing attacks simples (usando delay constante ou length check)
  if (pin.length !== 4) return false;

  // Em produção real, uma string comparison normal pode sofrer timing attacks.
  // Para este escopo, a validação exata é suficiente.
  return pin === SECRET_PIN;
}
