import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ArrowUpDown, Filter } from 'lucide-react';
import type { Sample } from '../types';

interface DraggableTableHeaderProps {
  id: string;
  index: number;
  field: keyof Sample;
  children: React.ReactNode;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  onSort: () => void;
  onFilter: () => void;
}

export function DraggableTableHeader({
  id,
  index,
  field,
  children,
  onMove,
  onSort,
  onFilter
}: DraggableTableHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { id, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ handlerId }, drop] = useDrop({
    accept: 'column',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item: { id: string; index: number }, monitor) {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) return;

      onMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <th
      ref={ref}
      scope="col"
      className={`px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider group truncate bg-gray-100 ${
        isDragging ? 'opacity-50' : ''
      }`}
      data-handler-id={handlerId}
    >
      <div className="flex items-center space-x-1">
        <button
          onClick={onSort}
          className="flex items-center hover:text-gray-700 cursor-move"
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