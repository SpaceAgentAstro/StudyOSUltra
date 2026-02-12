import { describe, it, expect } from 'vitest';
import { isValidInput, createUserMessage, createBotMessage, processGroundingChunks } from './chatHelpers';

describe('Chat Helpers', () => {

  describe('isValidInput', () => {
    it('returns true if text is present', () => {
      expect(isValidInput('Hello', false, null)).toBe(true);
      expect(isValidInput('Hello', true, null)).toBe(true);
    });

    it('returns true if attachment is present in manual mode', () => {
      expect(isValidInput('', true, 'image_url')).toBe(true);
      expect(isValidInput('   ', true, 'image_url')).toBe(true);
    });

    it('returns false if text is empty and no attachment', () => {
      expect(isValidInput('', false, null)).toBe(false);
      expect(isValidInput('   ', false, null)).toBe(false);
    });

    it('returns false if text is empty and attachment is present but not manual mode', () => {
      expect(isValidInput('', false, 'image_url')).toBe(false);
    });
  });

  describe('createUserMessage', () => {
    it('creates a user message with text', () => {
      const timestamp = 1234567890;
      const msg = createUserMessage('Hello', null, timestamp);
      expect(msg).toEqual({
        id: '1234567890',
        role: 'user',
        text: 'Hello',
        timestamp: 1234567890,
        attachments: undefined
      });
    });

    it('creates a user message with attachment', () => {
      const timestamp = 1234567890;
      const msg = createUserMessage('', 'image_url', timestamp);
      expect(msg.attachments).toEqual([{ type: 'image', url: 'image_url' }]);
    });
  });

  describe('createBotMessage', () => {
    it('creates a bot message correctly', () => {
      const timestamp = 1234567890;
      const msg = createBotMessage('TEACHER', timestamp);
      expect(msg).toEqual({
        id: '1234567890',
        role: 'model',
        agent: 'TEACHER',
        text: '',
        timestamp: 1234567890,
        isThinking: true
      });
    });
  });

  describe('processGroundingChunks', () => {
    it('adds new unique grounding chunks', () => {
      const current = [{ title: 'Google', uri: 'https://google.com' }];
      const newChunks = [
        { web: { title: 'Google', uri: 'https://google.com' } }, // Duplicate
        { web: { title: 'Bing', uri: 'https://bing.com' } }     // New
      ];

      const result = processGroundingChunks(current, newChunks);
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { title: 'Google', uri: 'https://google.com' },
        { title: 'Bing', uri: 'https://bing.com' }
      ]);
    });

    it('ignores invalid chunks', () => {
      const current: { title: string; uri: string }[] = [];
      const newChunks = [
        { web: { title: 'No URI' } },
        { other: {} }
      ];

      const result = processGroundingChunks(current, newChunks);
      expect(result).toHaveLength(0);
    });
  });

});
