import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../components/common/Toast';

describe('Toast', () => {
  it('should render success toast', () => {
    render(
      <Toast
        message="Success message"
        type="success"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    render(
      <Toast
        message="Error message"
        type="error"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should call onClose when clicking close button', () => {
    const onClose = vi.fn();
    render(
      <Toast
        message="Test message"
        type="info"
        onClose={onClose}
      />
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should auto close after duration', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    
    render(
      <Toast
        message="Auto close"
        type="info"
        onClose={onClose}
        duration={3000}
      />
    );

    vi.advanceTimersByTime(3000);

    expect(onClose).toHaveBeenCalled();
    vi.useRealTimers();
  });
});