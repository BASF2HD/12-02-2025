import { useState, useEffect } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  order: number;
}

export function useTableColumns(defaultColumns: ColumnConfig[]) {
  const { user } = useAuth();
  const [columns, setColumns] = useState<ColumnConfig[]>(() => {
    const saved = localStorage.getItem(`tableColumns_${user?.id}`);
    return saved ? JSON.parse(saved) : defaultColumns;
  });

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`tableColumns_${user.id}`, JSON.stringify(columns));
    }
  }, [columns, user?.id]);

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