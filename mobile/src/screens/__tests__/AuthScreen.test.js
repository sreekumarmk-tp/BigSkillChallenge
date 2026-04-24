import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AuthScreen from '../AuthScreen';
import { AppContext } from '../../context/AppContext';

// Mock vector icons to avoid act(...) warnings and simplify rendering
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock navigation and route
const mockNavigation = {
  navigate: jest.fn(),
};
const mockRoute = {
  params: { mode: 'login' },
};

const mockLogin = jest.fn();
const mockRegister = jest.fn();

const renderAuthScreen = (mode = 'login') => {
  return render(
    <AppContext.Provider value={{ login: mockLogin, register: mockRegister }}>
      <AuthScreen navigation={mockNavigation} route={{ params: { mode } }} />
    </AppContext.Provider>
  );
};

describe('AuthScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login mode by default when mode is login', () => {
    const { getByText, queryByPlaceholderText } = renderAuthScreen('login');
    
    expect(getByText('Log in to your account to continue')).toBeTruthy();
    expect(getByText('LOGIN NOW')).toBeTruthy();
    expect(queryByPlaceholderText('John Doe')).toBeNull(); 
  });

  it('renders register mode when mode is register', () => {
    const { getByText, getByPlaceholderText } = renderAuthScreen('register');
    
    expect(getByText('Create your account to enter the\nchallenge')).toBeTruthy();
    expect(getByText('CREATE ACCOUNT')).toBeTruthy();
    expect(getByPlaceholderText('John Doe')).toBeTruthy();
  });

  it('switches between login and register modes', async () => {
    const { getByText, queryByPlaceholderText, getByPlaceholderText } = renderAuthScreen('login');
    
    const registerToggle = getByText('Register');
    await act(async () => {
        fireEvent.press(registerToggle);
    });
    
    expect(getByPlaceholderText('John Doe')).toBeTruthy();
    
    const loginToggle = getByText('Login');
    await act(async () => {
        fireEvent.press(loginToggle);
    });
    
    expect(queryByPlaceholderText('John Doe')).toBeNull();
  });

  it('handles login with valid credentials', async () => {
    const { getByPlaceholderText, getByText } = renderAuthScreen('login');
    
    const emailInput = getByPlaceholderText('challenger@arena.com');
    const passwordInput = getByPlaceholderText('••••••••');
    const loginBtn = getByText('LOGIN NOW');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'password123');
    
    await act(async () => {
      fireEvent.press(loginBtn);
    });

    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Dashboard');
  });

  it('shows error message if login fails', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { detail: 'Invalid credentials' } }
    });

    const { getByPlaceholderText, getByText } = renderAuthScreen('login');
    
    fireEvent.changeText(getByPlaceholderText('challenger@arena.com'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrong');
    
    await act(async () => {
      fireEvent.press(getByText('LOGIN NOW'));
    });

    await waitFor(() => {
      expect(getByText('Invalid credentials')).toBeTruthy();
    });
  });

  it('handles registration with valid data and checkboxes', async () => {
    const { getByPlaceholderText, getByText } = renderAuthScreen('register');
    
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'John Smith');
    fireEvent.changeText(getByPlaceholderText('challenger@arena.com'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    
    // Select checkboxes
    const over18 = getByText('I confirm I am over 18');
    const terms = getByText('I agree to Terms & Conditions');
    const skill = getByText('I understand this is a skill-based competition');
    
    await act(async () => {
        fireEvent.press(over18);
        fireEvent.press(terms);
        fireEvent.press(skill);
    });
    
    const createBtn = getByText('CREATE ACCOUNT');
    await act(async () => {
      fireEvent.press(createBtn);
    });

    expect(mockRegister).toHaveBeenCalledWith('john@example.com', 'password123', 'John', 'Smith');
    expect(mockNavigation.navigate).toHaveBeenCalledWith('EmailVerify');
  });

  it('shows error if checkboxes are not checked during registration', async () => {
    const { getByPlaceholderText, getByText } = renderAuthScreen('register');
    
    fireEvent.changeText(getByPlaceholderText('John Doe'), 'John Smith');
    fireEvent.changeText(getByPlaceholderText('challenger@arena.com'), 'john@example.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    
    await act(async () => {
      fireEvent.press(getByText('CREATE ACCOUNT'));
    });

    await waitFor(() => {
        expect(getByText('Please confirm all checkboxes to register.')).toBeTruthy();
    });
    expect(mockRegister).not.toHaveBeenCalled();
  });
});

