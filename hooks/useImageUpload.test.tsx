import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';
import * as utils from '../utils';

// Mock the utils module
vi.mock('../utils', async () => {
  const actual = await vi.importActual('../utils');
  return {
    ...actual,
    readFile: vi.fn(),
  };
});

describe('useImageUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.imageAttachment).toBe(null);
  });

  it('handles image upload successfully', async () => {
    const { result } = renderHook(() => useImageUpload());
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    const mockDataURL = 'data:image/png;base64,mocked';

    // Control the readFile promise manually
    let resolveReadFile: (value: any) => void;
    (utils.readFile as any).mockImplementation(() => new Promise(resolve => {
        resolveReadFile = resolve;
    }));

    // Start upload
    let uploadPromise;
    await act(async () => {
      uploadPromise = result.current.handleImageUpload(event);
    });

    expect(result.current.isUploading).toBe(true);
    expect(result.current.uploadProgress).toBe(0);

    // Advance time by 100ms. Progress should have increased (50ms interval).
    act(() => {
        vi.advanceTimersByTime(100);
    });

    expect(result.current.uploadProgress).toBeGreaterThan(0);

    // Resolve readFile
    await act(async () => {
        // @ts-ignore
        resolveReadFile(mockDataURL);
    });

    // After resolve, we expect uploadProgress to be 100 and a 500ms timeout scheduled
    expect(result.current.uploadProgress).toBe(100);
    expect(result.current.isUploading).toBe(true);

    // Advance time by 500ms to trigger the final state update
    act(() => {
        vi.advanceTimersByTime(500);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.imageAttachment).toBe(mockDataURL);
  });

  it('handles upload failure', async () => {
    const { result } = renderHook(() => useImageUpload());
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = {
      target: {
        files: [file],
      },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    (utils.readFile as any).mockRejectedValue(new Error('Read failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.imageAttachment).toBe(null);
    expect(consoleSpy).toHaveBeenCalledWith('Upload failed', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('clears attachment', () => {
    const { result } = renderHook(() => useImageUpload());

    act(() => {
      result.current.setImageAttachment('some-image');
    });

    expect(result.current.imageAttachment).toBe('some-image');

    act(() => {
      result.current.clearAttachment();
    });

    expect(result.current.imageAttachment).toBe(null);
  });
});
