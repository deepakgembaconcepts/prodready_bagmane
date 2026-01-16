import { useMockData } from '../hooks/useMockData';
import { renderHook } from '@testing-library/react';

describe('useMockData Hook', () => {
    it('initializes with mock data', () => {
        const { result } = renderHook(() => useMockData());

        expect(result.current.tickets).toBeDefined();
        expect(result.current.assets).toBeDefined();
        expect(result.current.sites).toBeDefined();
        expect(Array.isArray(result.current.tickets)).toBe(true);
        expect(Array.isArray(result.current.assets)).toBe(true);
    });

    it('provides add ticket function', () => {
        const { result } = renderHook(() => useMockData());

        expect(typeof result.current.addTicket).toBe('function');
    });

    it('provides add asset function', () => {
        const { result } = renderHook(() => useMockData());

        expect(typeof result.current.addAsset).toBe('function');
    });
});
