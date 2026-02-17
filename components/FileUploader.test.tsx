
// @vitest-environment jsdom
import React, { useState } from 'react';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FileUploader from './FileUploader';
import { FileDocument } from '../types';

// Mock generateId to verify IDs if needed, but not strictly necessary.
// We'll rely on file names.

const TestWrapper = () => {
  const [files, setFiles] = useState<FileDocument[]>([]);
  return <FileUploader files={files} setFiles={setFiles} />;
};

describe('FileUploader', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles multiple file uploads with independent status messages', async () => {
    const { container } = render(<TestWrapper />);
    const fileInput = container.querySelector('input[type="file"]');
    if (!fileInput) throw new Error('File input not found');

    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.txt', { type: 'text/plain' });

    // 1. Upload file1
    act(() => {
      fireEvent.change(fileInput, { target: { files: [file1] } });
    });

    // Check file1 status - initially "Uploading..."
    const file1Name = screen.getByText('file1.txt');
    let file1Container = file1Name.closest('div');
    // DOM structure:
    // <div>
    //   <p>{file.name}</p>
    //   <p>{status}</p>
    // </div>
    // So parent of name contains the status.

    expect(within(file1Container!).getByText('Uploading...')).toBeTruthy();

    // 2. Advance time to change file1 status
    act(() => {
      vi.advanceTimersByTime(800);
    });

    // Check file1 status - should be "Reading Content..."
    expect(within(file1Container!).getByText('Reading Content...')).toBeTruthy();
    // Verify "Uploading..." is gone for file1
    expect(within(file1Container!).queryByText('Uploading...')).toBeNull();

    // 3. Upload file2
    act(() => {
      fireEvent.change(fileInput, { target: { files: [file2] } });
    });

    // 4. Verify statuses
    // file2 should be "Uploading..."
    const file2Name = screen.getByText('file2.txt');
    const file2Container = file2Name.closest('div');
    expect(within(file2Container!).getByText('Uploading...')).toBeTruthy();

    // CRITICAL: file1 should STILL be "Reading Content..."
    // In the buggy version, it would likely show "Uploading..." (the global state).
    expect(within(file1Container!).getByText('Reading Content...')).toBeTruthy();
    expect(within(file1Container!).queryByText('Uploading...')).toBeNull();
  });
});
