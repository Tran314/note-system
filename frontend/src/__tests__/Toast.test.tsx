import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider, toast } from '../components/common/Toast';

describe('Toast', () => {
  it('should render success toast', () => {
    render(
      <ToastProvider>
        <TestComponent message="Success message" type="success" />
      </ToastProvider>
    );

    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('should render error toast', () => {
    render(
      <ToastProvider>
        <TestComponent message="Error message" type="error" />
      </ToastProvider>
    );

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  it('should call onClose when clicking close button', () => {
    render(
      <ToastProvider>
        <TestComponent message="Test message" type="info" />
      </ToastProvider>
    );

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
  });

  it('should auto close after duration', async () => {
    vi.useFakeTimers();
    
    render(
      <ToastProvider>
        <TestComponent message="Auto close" type="info" duration={3000} />
      </ToastProvider>
    );

    expect(screen.getByText('Auto close')).toBeInTheDocument();
    
    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Auto close')).not.toBeInTheDocument();
    });
    
    vi.useRealTimers();
  });
});

function TestComponent({ message, type, duration }: { message: string; type: 'success' | 'error' | 'warning' | 'info'; duration?: number }) {
  const handleClick = () => {
    if (type === 'success') toast.success(message, { duration });
    else if (type === 'error') toast.error(message, { duration });
    else if (type === 'warning') toast.warning(message, { duration });
    else toast.info(message, { duration });
  };
  
  return <button onClick={handleClick}>Show Toast</button>;
}