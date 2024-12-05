// src/lib/__tests__/utils.test.ts

// src/lib/__tests__/utils.test.ts
import { formatDate, getPriorityColor, getStatusColor } from '../utils';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('formats a valid date correctly', () => {
      const date = '2024-03-15T00:00:00.000Z';
      const formattedDate = formatDate(date);
      // Using Spanish locale as per your application's requirements
      expect(formattedDate).toBe('15 de marzo de 2024');
    });

    it('handles null dates', () => {
      expect(formatDate(null)).toBe('No especificada');
    });

    it('handles invalid dates', () => {
      expect(formatDate('invalid-date')).toBe('Fecha inválida');
    });
  });

  describe('getPriorityColor', () => {
    it('returns correct color classes for each priority level', () => {
      expect(getPriorityColor('alta')).toBe('bg-red-100 text-red-800');
      expect(getPriorityColor('media')).toBe('bg-yellow-100 text-yellow-800');
      expect(getPriorityColor('baja')).toBe('bg-green-100 text-green-800');
    });

    it('returns default color classes for invalid priority', () => {
      // @ts-expect-error Testing invalid input
      expect(getPriorityColor('invalid')).toBe('bg-gray-100 text-gray-800');
    });
  });

  describe('getStatusColor', () => {
    it('returns correct color classes for each status', () => {
      expect(getStatusColor('pendiente')).toBe('bg-gray-100 text-gray-800');
      expect(getStatusColor('en_progreso')).toBe('bg-blue-100 text-blue-800');
      expect(getStatusColor('completada')).toBe('bg-green-100 text-green-800');
      expect(getStatusColor('rechazada')).toBe('bg-red-100 text-red-800');
    });

    it('handles invalid status gracefully', () => {
      // @ts-expect-error Testing invalid input
      expect(getStatusColor('invalid')).toBe('bg-gray-100 text-gray-800');
    });
  });
});