import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DEFAULT_ROOM_SETTINGS, GAME_OVER_TIME, ROUND_RESULT_TIME } from '@karalama/shared';
import { Room } from './Room';

/** Just enough of socket.io for the room to broadcast into the void. */
function fakeIo() {
  const emit = vi.fn();
  const target = { emit, except: () => ({ emit }) };
  return { to: () => target, sockets: { sockets: new Map() } } as never;
}

function fakeSocket(id: string) {
  return { id, join: vi.fn(), leave: vi.fn(), emit: vi.fn() } as never;
}

function roomWithHumanAndBot() {
  const room = new Room('ABC123', fakeIo(), { ...DEFAULT_ROOM_SETTINGS, totalRounds: 1, drawTime: 30 });
  room.addPlayer(fakeSocket('human'), 'Ahmet', '#6366f1');
  room.botController.createBot();
  return room;
}

// Private steps of the game loop, reached directly to keep the tests short
type RoomInternals = { endGame(): void; endTurn(): void };
const internals = (room: Room) => room as unknown as RoomInternals;

describe('Room phase timers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('a restarted game is not sent back to the lobby by the previous game-over timer', () => {
    const room = roomWithHumanAndBot();
    room.startGame();
    internals(room).endGame();
    expect(room.phase).toBe('GAME_OVER');

    // Host skips the podium and starts again right away
    room.backToLobby();
    room.startGame();
    expect(room.phase).toBe('PICKING');

    vi.advanceTimersByTime(GAME_OVER_TIME * 1000 + 100);
    expect(room.phase).not.toBe('WAITING');
    room.dispose();
  });

  it('a game that ended early does not start a new turn from the old result screen', () => {
    const room = roomWithHumanAndBot();
    room.startGame();
    internals(room).endTurn();
    expect(room.phase).toBe('ROUND_RESULT');

    // The only person leaves; one bot can't keep playing
    room.removePlayer('human');
    expect(room.phase).toBe('WAITING');

    vi.advanceTimersByTime(ROUND_RESULT_TIME * 1000 + 100);
    expect(room.phase).toBe('WAITING');
    expect(room.currentRound).toBe(0);
    room.dispose();
  });

  it('counts only people, not bots', () => {
    const room = roomWithHumanAndBot();
    expect(room.playerCount).toBe(2);
    expect(room.humanCount).toBe(1);
  });

  it('gives a new bot a colour no one in the room uses', () => {
    const room = roomWithHumanAndBot();
    const colors = [...room.players.values()].map((p) => p.avatarColor.toLowerCase());
    expect(new Set(colors).size).toBe(colors.length);
  });
});
