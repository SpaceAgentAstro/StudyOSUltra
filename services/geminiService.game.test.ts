import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateGameQuestions } from './geminiService';

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({
    models: {
      generateImages: vi.fn(),
      generateVideos: vi.fn(),
    },
  })),
}));

describe('generateGameQuestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  it('uses MCQ-only instruction for MCQ_ARENA mode', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: JSON.stringify([]) }),
    } as Response);

    await generateGameQuestions('Biology', 'MCQ_ARENA', [], 3);

    const fetchBody = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    const prompt = fetchBody.contents[1].parts[0].text as string;
    expect(prompt).toContain('exactly 3');
    expect(prompt).toContain('ONLY MCQ');
  });

  it('uses Open Ended-only instruction for EXPLAIN_TO_WIN mode', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ text: JSON.stringify([]) }),
    } as Response);

    await generateGameQuestions('Physics', 'EXPLAIN_TO_WIN', [], 4);

    const fetchBody = JSON.parse((vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string);
    const prompt = fetchBody.contents[1].parts[0].text as string;
    expect(prompt).toContain('exactly 4');
    expect(prompt).toContain('ONLY Open Ended');
  });
});
