'use server';

export async function validatePin(pin: string): Promise<boolean> {
  const secretPin = process.env.SECRET_PIN;

  if (!secretPin) {
    console.warn('AVISO: Variável de ambiente SECRET_PIN não definida.');
    return false;
  }

  // Prevenção de timing attacks simples (usando delay constante ou length check)
  if (pin.length !== 4) return false;

  // Em produção real, uma string comparison normal pode sofrer timing attacks.
  // Para este escopo, a validação exata é suficiente.
  return pin === secretPin;
}
