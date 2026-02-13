import { describe, it, expect } from 'vitest';
import ChatMessage from './ChatMessage';
import { AGENTS } from '../constants';

describe('ChatMessage Component', () => {
  it('should be a valid component', () => {
    expect(ChatMessage).toBeDefined();
    // React.memo returns an object with $$typeof and type
    expect(typeof ChatMessage).toBe('object');
  });

  it('AGENTS constant should be available', () => {
      expect(AGENTS).toBeDefined();
      expect(AGENTS.length).toBeGreaterThan(0);
      expect(AGENTS[0].role).toBe('COUNCIL');
  });
});
