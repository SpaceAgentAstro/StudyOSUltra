import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useImageUpload } from './useImageUpload';
import { vi, describe, it, expect } from 'vitest';

// Mock readFile
vi.mock('../utils', () => ({
  readFile: vi.fn().mockResolvedValue('data:image/png;base64,mocked'),
}));

describe('useImageUpload', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useImageUpload());
    expect(result.current.isUploading).toBe(false);
    expect(result.current.uploadProgress).toBe(0);
    expect(result.current.imageAttachment).toBe(null);
  });

  it('should handle image upload', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useImageUpload());

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const event = {
      target: { files: [file] },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    // Start the upload
    await act(async () => {
      await result.current.handleImageUpload(event);
    });

    // Initial state after starting upload
    expect(result.current.isUploading).toBe(true);

    // Fast-forward timers to simulate progress and reach the timeout
    await act(async () => {
        vi.runAllTimers();
    });

    // Check final state
    expect(result.current.isUploading).toBe(false);
    expect(result.current.imageAttachment).toBe('data:image/png;base64,mocked');
    expect(result.current.uploadProgress).toBe(0);

    vi.useRealTimers();
  });

  it('should clear attachment', () => {
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
