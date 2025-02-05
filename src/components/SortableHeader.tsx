import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ArrowUpDown, Filter } from 'lucide-react';
import type { Sample } from '../types';

interface SortableHeaderProps {
  field: keyof Sample;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  onSort: () => void;
  onFilter: () => void;
  children: React.ReactNode;
}

interface DragItem {
  index: number;
  field: keyof Sample;
  type: string;
}

export function SortableHeader({ 
  field, 
  index, 
  moveColumn, 
  onSort, 
  onFilter, 
  children 
}: SortableHeaderProps) {
  const ref = React.useRef<HTMLTableCellElement>(null);

  const [{ isDragging }, drag] = useDrag<DragItem, void, { isDragging: boolean }>({
    type: 'COLUMN',
    item: { index, field, type: 'COLUMN' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'COLUMN',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      const hoverMiddleX = (hoverBoundingRect.right - hoverBoundingRect.left) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientX = (clientOffset?.x || 0) - hoverBoundingRect.left;

      if (dragIndex < hoverIndex && hoverClientX < hoverMiddleX) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientX > hoverMiddleX) {
        return;
      }

      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  return (
    <th 
      ref={ref}
      scope="col" 
      className={`px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider group truncate bg-gray-100 ${
        isDragging ? 'opacity-50 cursor-move' : 'cursor-grab'
      }`}
      data-handler-id={handlerId}
    >
      <div className="flex items-center space-x-1">
        <button
          onClick={onSort}
          className="flex items-center hover:text-gray-700"
        >
          <span>{children}</span>
          <ArrowUpDown className="h-3 w-3 ml-1" />
        </button>
        <button
          onClick={onFilter}
          className="opacity-0 group-hover:opacity-100 hover:text-blue-600"
        >
          <Filter className="h-3 w-3" />
        </button>
      </div>
    </th>
  );
}