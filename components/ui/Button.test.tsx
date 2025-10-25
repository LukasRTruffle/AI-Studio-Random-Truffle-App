import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from './Button';

// Mock matchMedia for testing environments like JSDOM
window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};


describe('Button', () => {
    test('renders button with children', () => {
        render(<Button>Click Me</Button>);
        const buttonElement = screen.getByText(/Click Me/i);
        expect(buttonElement).not.toBeNull();
    });
});
