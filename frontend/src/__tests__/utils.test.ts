import { describe, it, expect } from 'vitest';
import { formatDate, timeAgo, truncate, debounce, formatFileSize } from '../utils/format';

describe('formatDate', () => {
  it('should format date in short format', () => {
    const date = '2026-04-10T12:00:00Z';
    const result = formatDate(date, 'short');
    
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/04/);
    expect(result).toMatch(/10/);
  });

  it('should format date in long format', () => {
    const date = '2026-04-10T12:00:00Z';
    const result = formatDate(date, 'long');
    
    expect(result).toContain('2026');
  });

  it('should return "-" for invalid date', () => {
    const result = formatDate('invalid-date');
    expect(result).toBe('-');
  });
});

describe('timeAgo', () => {
  it('should return "刚刚" for recent time', () => {
    const now = new Date();
    const result = timeAgo(now);
    
    expect(result).toBe('刚刚');
  });

  it('should return minutes ago', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const result = timeAgo(fiveMinutesAgo);
    
    expect(result).toContain('分钟前');
  });

  it('should return hours ago', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const result = timeAgo(twoHoursAgo);
    
    expect(result).toContain('小时前');
  });

  it('should return days ago', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const result = timeAgo(threeDaysAgo);
    
    expect(result).toContain('天前');
  });

  it('should return "-" for invalid date', () => {
    const result = timeAgo('invalid-date');
    expect(result).toBe('-');
  });
});

describe('truncate', () => {
  it('should truncate long text', () => {
    const text = 'This is a very long text that needs to be truncated';
    const result = truncate(text, 20);
    
    expect(result.length).toBeLessThanOrEqual(23);
    expect(result.endsWith('...')).toBe(true);
  });

  it('should not truncate short text', () => {
    const text = 'Short text';
    const result = truncate(text, 20);
    
    expect(result).toBe(text);
  });

  it('should handle empty string', () => {
    const result = truncate('', 10);
    expect(result).toBe('');
  });
});

describe('formatFileSize', () => {
  it('should format bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should format kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(2560)).toBe('2.5 KB');
  });

  it('should format megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(2621440)).toBe('2.5 MB');
  });

  it('should format gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1 GB');
  });
});

describe('debounce', () => {
  it('should debounce function calls', async () => {
    let callCount = 0;
    const fn = () => callCount++;
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    expect(callCount).toBe(0);

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(callCount).toBe(1);
  });
});