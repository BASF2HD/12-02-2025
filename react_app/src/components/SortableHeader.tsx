import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ArrowUpDown, Filter } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onSort: () => void;
  onFilter: () => void;
  hasActiveFilter?: boolean;
  index: number;
  moveColumn: (dragIndex: number, hoverIndex: number) => void;
  field: keyof any; //Added this line to address type error
}

export function SortableHeader({ children, onSort, onFilter, hasActiveFilter, index, moveColumn, field }: Props) {
  const ref = React.useRef<HTMLTableCellElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { index, field }, //Added field back to item
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  });

  const [, drop] = useDrop({
    accept: 'column',
    hover(item: { index: number }, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveColumn(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  drag(drop(ref));

  return (
    <th 
      ref={ref}
      scope="col" 
      className={`px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider group truncate bg-gray-100 ${
        isDragging ? 'opacity-50 cursor-move' : 'cursor-grab'
      }`}
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
          className={`${hasActiveFilter ? 'text-blue-600' : 'opacity-0 group-hover:opacity-100'} hover:text-blue-600`}
        >
          <Filter className="h-3 w-3" />
        </button>
      </div>
    </th>
  );
}