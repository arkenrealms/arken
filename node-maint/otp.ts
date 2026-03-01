import { authenticator } from 'otplib';

// Optionally, set the TOTP options if needed (e.g., window, step)
authenticator.options = {
  window: 1, // Allows for a 1-step window (default is 1)
  step: 30, // TOTP code validity in seconds (default is 30)
};

// Function to generate the current TOTP code
export function generateTotp(totpSecret: string): string {
  return authenticator.generate(totpSecret);
}
