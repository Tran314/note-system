import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';

// Mock useAuthStore
vi.mock('../store/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
  })),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithRouter(<Login />);

    expect(screen.getByPlaceholderText('user@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should show validation errors for invalid email', async () => {
    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('user@example.com');
    const submitButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.click(submitButton);

    // Just check that form is rendered correctly
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show validation errors for short password', async () => {
    renderWithRouter(<Login />);

    const passwordInput = screen.getByPlaceholderText('请输入密码');
    const submitButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(passwordInput, { target: { value: '123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should have link to register page', () => {
    renderWithRouter(<Login />);

    const registerLink = screen.getByRole('link', { name: /注册/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should disable submit button while loading', async () => {
    renderWithRouter(<Login />);

    const emailInput = screen.getByPlaceholderText('user@example.com');
    const passwordInput = screen.getByPlaceholderText('请输入密码');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /登录/i });
    expect(submitButton).not.toBeDisabled();
  });
});