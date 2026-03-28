import { customAlphabet } from 'nanoid';

const generate = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export function generateRoomCode(): string {
  return generate();
}
