import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export function useTableColumns(defaultColumns: ColumnConfig[]) {
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem('tableColumns');
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  useEffect(() => {
    localStorage.setItem('tableColumns', JSON.stringify(columns));
  }, [columns]);

  const moveColumn = (dragIndex: number, hoverIndex: number) => {
    const newColumns = [...columns];
    const draggedColumn = newColumns[dragIndex];
    newColumns.splice(dragIndex, 1);
    newColumns.splice(hoverIndex, 0, draggedColumn);
    
    // Update order property
    newColumns.forEach((col, index) => {
      col.order = index;
    });
    
    setColumns(newColumns);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const resetToDefault = () => {
    setColumns(defaultColumns);
  };

  return {
    columns,
    moveColumn,
    toggleColumnVisibility,
    resetToDefault
  };
}