// src/__mocks__/airtable.ts
// Define a mock base with all the methods we need
const mockBase = {
  select: jest.fn().mockReturnValue({
    all: jest.fn().mockResolvedValue([{
      id: '1',
      fields: {
        'Titulo': 'Test Task',
        'Estado': 'pendiente',
        'Prioridad': 'media',
        'Fecha limite': '2024-03-15T00:00:00.000Z',
        'Asignado A': ['User 1'],
        'Creado por': 'Test User',
        'Fecha de creación': '2024-03-10T00:00:00.000Z',
      }
    }])
  }),
  find: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
};

// Create the mock Airtable constructor
function MockAirtable() {
  return {
    base: () => mockBase
  };
}

// Add the base method directly to the constructor
MockAirtable.base = () => mockBase;

// Export the mock
module.exports = MockAirtable;