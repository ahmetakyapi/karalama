import type { Player as PlayerType } from '@karalama/shared';

export class Player implements PlayerType {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  guessedThisRound: boolean;
  isBot: boolean;
  socketId: string;

  constructor(
    id: string,
    socketId: string,
    name: string,
    avatarColor: string,
    isHost: boolean,
    isBot: boolean = false
  ) {
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.avatarColor = avatarColor;
    this.score = 0;
    this.isHost = isHost;
    this.isReady = false;
    this.isConnected = true;
    this.guessedThisRound = false;
    this.isBot = isBot;
  }

  toPublic(): PlayerType {
    return {
      id: this.id,
      name: this.name,
      avatarColor: this.avatarColor,
      score: this.score,
      isHost: this.isHost,
      isReady: this.isReady,
      isConnected: this.isConnected,
      guessedThisRound: this.guessedThisRound,
      isBot: this.isBot,
    };
  }
}
