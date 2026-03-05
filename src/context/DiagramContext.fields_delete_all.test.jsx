import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import DiagramContextProvider, { DiagramContext } from './DiagramContext.jsx';

// Mock hooks used by DiagramContext so we can observe undo/redo calls
vi.mock('../hooks', () => {
  const setUndoStack = vi.fn();
  const setRedoStack = vi.fn();

  return {
    useTransform: () => ({ transform: { pan: { x: 0, y: 0 } } }),
    useUndoRedo: () => ({
      undoStack: [],
      redoStack: [],
      setUndoStack,
      setRedoStack,
    }),
    useSelect: () => ({
      selectedElement: { element: null, id: null, open: false },
      setSelectedElement: vi.fn(),
    }),
  };
});

// Re-import the mocks so we can assert on them
import { useUndoRedo } from '../hooks';

function getUndoRedoMocks() {
  const { setUndoStack, setRedoStack } = useUndoRedo();
  return { setUndoStack, setRedoStack };
}

let ctx;

function CaptureContext() {
  ctx = useContext(DiagramContext);
  return null;
}

describe('deleteAllFields / fields_delete_all history', () => {
  beforeEach(() => {
    const { setUndoStack, setRedoStack } = getUndoRedoMocks();
    setUndoStack.mockClear();
    setRedoStack.mockClear();
  });

  it('removes all fields and related relationships, and records history entry', () => {
    render(
      <DiagramContextProvider>
        <CaptureContext />
      </DiagramContextProvider>,
    );

    const tableId = 't1';
    const field1 = { id: 'f1', name: 'id' };
    const field2 = { id: 'f2', name: 'other' };

    const rel1 = {
      id: 'r1',
      startTableId: tableId,
      startFieldId: field1.id,
      endTableId: 't2',
      endFieldId: 'fX',
    };

    act(() => {
      ctx.setTables([
        {
          id: tableId,
          name: 'users',
          x: 0,
          y: 0,
          locked: false,
          fields: [field1, field2],
          comment: '',
          indices: [],
          color: '#000000',
        },
      ]);
      ctx.setRelationships([rel1]);
    });

    const { setUndoStack } = getUndoRedoMocks();

    act(() => {
      ctx.deleteAllFields(tableId);
    });

    // All fields removed
    const updatedTable = ctx.tables.find((t) => t.id === tableId);
    expect(updatedTable.fields).toEqual([]);

    // Related relationships removed
    expect(ctx.relationships).toEqual([]);

    // History entry pushed
    expect(setUndoStack).toHaveBeenCalled();
    const lastCall =
      setUndoStack.mock.calls[setUndoStack.mock.calls.length - 1][0];
    const historyEntry = lastCall[lastCall.length - 1];

    expect(historyEntry.component).toBe('fields_delete_all');
    expect(historyEntry.tid).toBe(tableId);
    expect(historyEntry.data.fields).toEqual([field1, field2]);
    expect(historyEntry.data.relationship).toEqual([rel1]);
  });
}

