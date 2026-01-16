# Testing Guide

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Files Created

1. **`__tests__/Dashboard.test.tsx`** - Dashboard component tests
2. **`__tests__/useMockData.test.ts`** - useMockData hook tests
3. **`__tests__/api.test.js`** - API endpoint tests

## Coverage Target

- **70%** minimum coverage for all metrics (branches, functions, lines, statements)

## Test Configuration

- **Framework:** Jest 30.2.0
- **Testing Library:** @testing-library/react 16.3.1
- **TypeScript Support:** ts-jest 29.4.6
- **Environment:** jsdom (browser simulation)

## Writing New Tests

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText(/expected text/i)).toBeInTheDocument();
  });
});
```

### Hook Tests
```typescript
import { renderHook } from '@testing-library/react';
import { useYourHook } from '../hooks/useYourHook';

describe('useYourHook', () => {
  it('returns expected value', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current).toBeDefined();
  });
});
```

### API Tests
```javascript
const request = require('supertest');
const app = require('../server');

describe('API Endpoints', () => {
  it('returns 200 for health check', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Test Behavior, Not Implementation** - Focus on what the component does, not how it does it
2. **Use Type Assertions** - For test mocks, use `as Type[]` to simplify mock data
3. **Keep Tests Simple** - Each test should verify one thing
4. **Use Descriptive Names** - Test names should clearly describe what they're testing
5. **Mock External Dependencies** - Use Jest mocks for API calls, external libraries, etc.

## Common Issues

### TypeScript Errors
If you see TypeScript errors about missing properties in mock data, use type assertions:
```typescript
const mockData = [{ partial: 'data' }] as FullType[];
```

### Module Not Found
Make sure all testing dependencies are installed:
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest
```

### Tests Not Running
Check that `jest.config.js` and `jest.setup.js` are in the project root.
