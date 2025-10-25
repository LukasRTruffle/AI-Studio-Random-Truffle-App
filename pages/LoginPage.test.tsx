import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './LoginPage';
import { BrowserRouter } from 'react-router-dom';

// Mock matchMedia for testing environments like JSDOM
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};

describe('LoginPage', () => {
  test('renders login form', () => {
    render(
        <BrowserRouter>
            <LoginPage />
        </BrowserRouter>
    );
    expect(screen.getByText(/Sign in to your account/i)).not.toBeNull();
  });
});
