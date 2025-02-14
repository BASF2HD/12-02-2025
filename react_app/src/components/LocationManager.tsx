
import React, { useState } from 'react';
import { Plus, X, Save, Trash2 } from 'lucide-react';

interface Position {
  row: number;
  col: number;
  isOccupied: boolean;
}

interface Box {
  id: string;
  name: string;
  positions: Position[];
}

interface Drawer {
  id: string;
  name: string;
  boxes: Box[];
}

interface Shelf {
  id: string;
  name: string;
  drawers: Drawer[];
}

interface Freezer {
  id: string;
  name: string;
  type: string;
  shelves: Shelf[];
}

export function LocationManager({ onClose }: { onClose: () => void }) {
  const [freezers, setFreezers] = useState<Freezer[]>([]);
  const [newFreezer, setNewFreezer] = useState({ 
    name: '', 
    type: '', 
    shelfCount: 1, 
    drawerCount: 1, 
    boxCount: 1,
    boxRows: 9,
    boxColumns: 9
  });

  const addFreezer = () => {
    const shelves = Array.from({ length: Number(newFreezer.shelfCount) }, (_, shelfIndex) => ({
      id: `shelf-${shelfIndex}`,
      name: `Shelf ${String.fromCharCode(65 + shelfIndex)}`,
      drawers: Array.from({ length: Number(newFreezer.drawerCount) }, (_, drawerIndex) => ({
        id: `drawer-${drawerIndex}`,
        name: `Drawer ${String.fromCharCode(65 + shelfIndex)}${drawerIndex + 1}`,
        boxes: Array.from({ length: Number(newFreezer.boxCount) }, (_, boxIndex) => ({
          id: `box-${boxIndex}`,
          name: `Box ${String(boxIndex + 1).padStart(3, '0')}`,
          positions: Array.from({ length: newFreezer.boxRows * newFreezer.boxColumns }, (_, i) => ({
            row: Math.floor(i / newFreezer.boxColumns) + 1,
            col: (i % newFreezer.boxColumns) + 1,
            isOccupied: false
          }))
        }))
      }))
    }));

    const newFreezerObj: Freezer = {
      id: `freezer-${Date.now()}`,
      name: newFreezer.name,
      type: newFreezer.type,
      shelves
    };

    setFreezers([...freezers, newFreezerObj]);
    setNewFreezer({ name: '', type: '', shelfCount: 1, drawerCount: 1, boxCount: 1 });
  };

  const deleteFreezer = (freezerId: string) => {
    setFreezers(freezers.filter(f => f.id !== freezerId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-[90%] max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center px-4 py-2 border-b">
          <h2 className="text-lg font-medium">Storage Location Manager</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="p-4 flex-1 overflow-auto">
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-3">Add New Freezer</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="Freezer Name"
                value={newFreezer.name}
                onChange={e => setNewFreezer({ ...newFreezer, name: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="text"
                placeholder="Freezer Type"
                value={newFreezer.type}
                onChange={e => setNewFreezer({ ...newFreezer, type: e.target.value })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="number"
                min="1"
                placeholder="Number of Shelves"
                value={newFreezer.shelfCount}
                onChange={e => setNewFreezer({ ...newFreezer, shelfCount: Number(e.target.value) })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="number"
                min="1"
                placeholder="Drawers per Shelf"
                value={newFreezer.drawerCount}
                onChange={e => setNewFreezer({ ...newFreezer, drawerCount: Number(e.target.value) })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="number"
                min="1"
                placeholder="Boxes per Drawer"
                value={newFreezer.boxCount}
                onChange={e => setNewFreezer({ ...newFreezer, boxCount: Number(e.target.value) })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Box Rows"
                value={newFreezer.boxRows}
                onChange={e => setNewFreezer({ ...newFreezer, boxRows: Number(e.target.value) })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <input
                type="number"
                min="1"
                max="20"
                placeholder="Box Columns"
                value={newFreezer.boxColumns}
                onChange={e => setNewFreezer({ ...newFreezer, boxColumns: Number(e.target.value) })}
                className="border rounded px-2 py-1 text-sm w-full"
              />
            </div>
            <button
              onClick={addFreezer}
              className="mt-3 flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Freezer
            </button>
          </div>

          <div className="space-y-4">
            {freezers.map(freezer => (
              <div key={freezer.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h3 className="text-sm font-medium">{freezer.name}</h3>
                    <p className="text-xs text-gray-500">{freezer.type}</p>
                  </div>
                  <button
                    onClick={() => deleteFreezer(freezer.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-full grid grid-cols-3 gap-4 mb-2">
                    <div className="text-xs font-medium text-gray-700">Shelf</div>
                    <div className="text-xs font-medium text-gray-700">Drawer</div>
                    <div className="text-xs font-medium text-gray-700">Box</div>
                  </div>
                  {freezer.shelves.map(shelf => (
                    <div key={shelf.id} className="border rounded p-2">
                      <h4 className="text-xs font-medium mb-2">{shelf.name}</h4>
                      <div className="space-y-2">
                        {shelf.drawers.map(drawer => (
                          <div key={drawer.id} className="bg-gray-50 p-2 rounded">
                            <h5 className="text-xs font-medium mb-1">{drawer.name}</h5>
                            <div className="grid grid-cols-3 gap-1">
                              {drawer.boxes.map(box => (
                                <div key={box.id} className="bg-white border rounded p-2">
                                  <input
                                    type="text"
                                    value={box.name}
                                    onChange={(e) => {
                                      const newName = e.target.value;
                                      const updatedFreezers = freezers.map(f => 
                                        f.id === freezer.id ? {
                                          ...f,
                                          shelves: f.shelves.map(s =>
                                            s.id === shelf.id ? {
                                              ...s,
                                              drawers: s.drawers.map(d =>
                                                d.id === drawer.id ? {
                                                  ...d,
                                                  boxes: d.boxes.map(b =>
                                                    b.id === box.id ? { ...b, name: newName } : b
                                                  )
                                                } : d
                                              )
                                            } : s
                                          )
                                        } : f
                                      );
                                      setFreezers(updatedFreezers);
                                    }}
                                    className="w-full text-xs border-gray-300 rounded-md mb-2"
                                  />
                                  <>
                                    <input
                                      type="text"
                                      value={box.name}
                                      onChange={(e) => {
                                        const newName = e.target.value;
                                        const updatedFreezers = freezers.map(f => 
                                          f.id === freezer.id ? {
                                            ...f,
                                            shelves: f.shelves.map(s =>
                                              s.id === shelf.id ? {
                                                ...s,
                                                drawers: s.drawers.map(d =>
                                                  d.id === drawer.id ? {
                                                    ...d,
                                                    boxes: d.boxes.map(b =>
                                                      b.id === box.id ? { ...b, name: newName } : b
                                                    )
                                                  } : d
                                                )
                                              } : s
                                            )
                                          } : f
                                        );
                                        setFreezers(updatedFreezers);
                                      }}
                                      className="w-full text-xs border-gray-300 rounded-md mb-2"
                                    />
                                    <div>
                                      {/* Column Labels */}
                                      <div className="flex justify-end mb-1">
                                        <div className="w-4"></div>
                                        <div className={`flex-1 grid grid-cols-${box.positions[0].col} gap-[1px]`}>
                                          {[...Array(box.positions[0].col)].map((_, i) => (
                                            <div key={i} className="text-[10px] text-center font-semibold text-gray-700 bg-gray-100 p-0.5 rounded">
                                              Column {i + 1}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      {/* Row Labels and Grid */}
                                      <div className="flex">
                                        <div className="flex flex-col justify-between mr-1 py-[1px]">
                                          {[...Array(box.positions.length / box.positions[0].col)].map((_, i) => (
                                            <div key={i} className="text-[10px] text-right font-semibold text-gray-700">
                                              Row {i + 1}
                                            </div>
                                          ))}
                                        </div>
                                        <div className={`flex-1 grid grid-cols-${box.positions[0].col} gap-[1px]`}>
                                        {box.positions.map((pos, i) => (
                                          <div
                                            key={i}
                                            className={`w-2 h-2 ${
                                              pos.isOccupied ? 'bg-red-500' : 'bg-green-500'
                                            } rounded-sm relative`}
                                            title={`Position ${pos.row},${pos.col}`}
                                          >
                                            {pos.col === 1 && (
                                              <span className="absolute right-full mr-1 text-[8px]">
                                                {pos.row}
                                              </span>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                      </div>
                                    </div>
                                  </>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t px-4 py-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
