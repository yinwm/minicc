import { SessionManager } from '../src/services/session.service';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  readdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  rmSync: jest.fn()
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe('SessionManager', () => {
  let sessionManager: SessionManager;
  const testDir = '.test-history';

  beforeEach(() => {
    jest.clearAllMocks();
    sessionManager = new SessionManager(testDir);
  });

  test('should create session successfully', async () => {
    mockFs.existsSync.mockReturnValue(false);

    const session = await sessionManager.createSession('test-id');

    expect(session).toBeDefined();
    expect(session.id).toBe('test-id');
    expect(session.messages).toEqual([]);
    expect(mockFs.mkdirSync).toHaveBeenCalledWith(testDir, { recursive: true });
  });

  test('should list sessions from directory', async () => {
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readdirSync.mockReturnValue(['session1.json', 'session2.json', 'not-json.txt'] as any);

    const sessions = await sessionManager.listSessions();

    expect(sessions).toEqual(['session1', 'session2']);
  });

  test('should return empty array when no sessions directory', async () => {
    mockFs.existsSync.mockReturnValue(false);

    const sessions = await sessionManager.listSessions();

    expect(sessions).toEqual([]);
  });

  test('should get session from file', async () => {
    const mockSessionData = {
      id: 'test-id',
      startTime: new Date('2023-01-01'),
      lastUpdateTime: new Date('2023-01-02'),
      messages: []
    };

    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(JSON.stringify(mockSessionData));

    const session = await sessionManager.getSession('test-id');

    expect(session).toBeDefined();
    expect(session!.id).toBe('test-id');
    expect(mockFs.readFileSync).toHaveBeenCalledWith(path.join(testDir, 'test-id.json'), 'utf-8');
  });

  test('should return null for non-existent session', async () => {
    mockFs.existsSync.mockReturnValue(false);

    const session = await sessionManager.getSession('non-existent');

    expect(session).toBeNull();
  });

  test('should delete session file', async () => {
    mockFs.existsSync.mockReturnValue(true);

    await sessionManager.deleteSession('test-id');

    expect(mockFs.unlinkSync).toHaveBeenCalledWith(path.join(testDir, 'test-id.json'));
  });

  test('should clear all sessions', async () => {
    mockFs.existsSync.mockReturnValue(true);

    await sessionManager.clearAllSessions();

    expect(mockFs.rmSync).toHaveBeenCalledWith(testDir, { recursive: true, force: true });
  });
});
