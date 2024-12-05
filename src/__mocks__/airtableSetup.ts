// src/__mocks__/airtableSetup.ts
export const mockAirtableResponse = {
    id: '1',
    fields: {
      'Titulo': 'Test Task',
      'Estado': 'pendiente',
      'Prioridad': 'media',
      'Fecha limite': '2024-03-15T00:00:00.000Z',
      'Asignado A': ['User 1'],
      'Creado por': 'Test User',
      'Fecha de creación': '2024-03-10T00:00:00.000Z',
      'Ultima Actualizacion': '2024-03-10T00:00:00.000Z',
    }
  };
  
  // Mock Airtable class and its methods
  export const mockAirtableBase = {
    select: jest.fn(() => ({
      all: jest.fn().mockResolvedValue([mockAirtableResponse])
    })),
    find: jest.fn().mockResolvedValue(mockAirtableResponse),
    create: jest.fn().mockResolvedValue(mockAirtableResponse),
    update: jest.fn().mockResolvedValue(mockAirtableResponse),
  };
  
  export const MockAirtable = jest.fn(() => ({
    base: jest.fn(() => mockAirtableBase)
  }));