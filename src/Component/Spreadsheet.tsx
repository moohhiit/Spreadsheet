import { useState, useMemo, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  getFilteredRowModel
} from "@tanstack/react-table";
import {

  Filter,
  Download,
  Upload,
  Share2,
  ChevronRight,
  Search,
  Eye,
  GalleryHorizontalEnd,
  Plus,
  ArrowUpDown,
  Bell,
} from "lucide-react";
interface SpreadsheetCell {
  id: number;
  [key: string]: string | number;
}

// Generate initial table data with sample rows
const createInitialData = (): SpreadsheetCell[] => {
  const columns = [
    "Job Request",
    "Submitted",
    "Status",
    "Submitter",
    "URL",
    "Assigned",
    "Priority",
    "Due Date",
    "Est. Value",
  ];

  const sampleRows = [
    ["Launch social media campaign for product XYZ", "15-11-2024", "In-process", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "high", "20-11-2024", "6,200,000"],
    ["Launch social media campaign for product XYZ", "15-11-2024", "Need to start", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "Medium", "20-11-2024", "6,200,000"],
    ["Launch social media campaign for product XYZ", "15-11-2024", "Complete", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "Medium", "20-11-2024", "6,200,000"],
    ["Launch social media campaign for product XYZ", "15-11-2024", "In-process", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "Medium", "20-11-2024", "6,200,000"],
    ["Launch social media campaign for product XYZ", "15-11-2024", "Blocked", "Aisha Patel", "www.aishapatel.com", "Sophie Choudhury", "low", "20-11-2024", "6,200,000"],

  ];

  const data: SpreadsheetCell[] = [];

  sampleRows.forEach((row, i) => {
    const cell: SpreadsheetCell = { id: i + 1 };
    columns.forEach((col, j) => (cell[col] = row[j] || ""));
    data.push(cell);
  });

  for (let i = sampleRows.length; i < 100; i++) {
    const emptyRow: SpreadsheetCell = { id: i + 1 };
    columns.forEach((col) => (emptyRow[col] = ""));
    data.push(emptyRow);
  }

  return data;
};

const getStatusClass = (status: string) => {
  const s = status.toLowerCase();
  return s === "in-process"
    ? "bg-yellow-100"
    : s === "need to start"
      ? "bg-blue-100"
      : s === "complete"
        ? "bg-green-100"
        : s === "blocked"
          ? "bg-red-100 "
          : "bg-gray-100";
};

const getPriorityClass = (priority: string) => {
  const p = priority.toLowerCase();
  return p === "high"
    ? "text-red-500"
    : p === "medium"
      ? "text-orange-400"
      : p === "low"
        ? "text-blue-500"
        : "bg-gray-100";
};

const Spreadsheet = () => {
  const [data, setData] = useState(createInitialData());
  const [globalFilter, setGlobalFilter] = useState("");
  const [selected, setSelected] = useState<{ row: number; col: string } | null>(null);
  const [editing, setEditing] = useState<{ row: number; col: string } | null>(null);
  const [columnKeys, setColumnKeys] = useState([
    "Job Request",
    "Submitted",
    "Status",
    "Submitter",
    "URL",
    "Assigned",
    "Priority",
    "Due Date",
    "Est. Value",

  ]);

  const columnHelper = createColumnHelper<SpreadsheetCell>();

  const addColumn = () => {
    const name = prompt("Enter column name:");
    if (!name) return;
    const colName = name.trim();
    if (columnKeys.includes(colName)) {
      alert("Column already exists");
      return;
    }
    const newData = data.map((row) => ({ ...row, [colName]: "" }));
    setColumnKeys([...columnKeys, colName]);
    setData(newData);
  };

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("id", {
        header: "#",
        cell: (info) => <div className="text-center text-gray-500">{info.getValue()}</div>,
      }),
      ...columnKeys.map((col) =>
        columnHelper.accessor((row) => row[col], {
          id: col,
          header: col,
          enableGlobalFilter: true,
          cell: (info) => {
            const value = info.getValue() as string;
            const row = info.row.index;
            const colId = info.column.id;
            const isEdit = editing?.row === row && editing.col === colId

            if (isEdit) {
              return (
                <input
                  value={value}
                  onChange={(e) => {
                    const newData = [...data];
                    newData[row][colId] = e.target.value;
                    setData(newData);
                  }}
                  onBlur={() => setEditing(null)}
                  onKeyDown={(e) => e.key === "Enter" && setEditing(null)}
                  autoFocus
                  className="w-full outline-none bg-transparent"
                />
              );
            }

            const cellStyle =
              colId === "Status" ? getStatusClass(value) : colId === "Priority" ? getPriorityClass(value) : "";

            return <span className={`block px-2 py-1 ${cellStyle}`}>{value}</span>;
          },
        })
      ),
      columnHelper.display({
        id: "add_column",
        header: () => (
          <button
            onClick={addColumn}
            className="w-20"
          >
            <Plus />         </button>
        ),
        cell: () => null,
      }),
    ];
  }, [editing, data, columnKeys]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    },
  });


  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!selected || editing) return;
      const colList = columnKeys;
      let { row, col } = selected;
      const i = colList.indexOf(col);

      if (e.key === "ArrowDown") row = Math.min(data.length - 1, row + 1);
      if (e.key === "ArrowUp") row = Math.max(0, row - 1);
      if (e.key === "ArrowLeft" && i > 0) col = colList[i - 1];
      if (e.key === "ArrowRight" && i < colList.length - 1) col = colList[i + 1];
      if (e.key === "Enter" && col !== "id") setEditing({ row, col });

      setSelected({ row, col });
    };


    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selected, editing, data, columnKeys]);

  const handleToolbarAction = (label: string) => alert(`${label} clicked`);

  return (
    <div className="">
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                <GalleryHorizontalEnd style={{ color: 'green' }} />
              </div>
              <span className="text-sm font-medium text-gray-500">
                Workspace
              </span>

            </div>
            <ChevronRight className="text-gray-400" />
            <span className="text-sm text-gray-600">Folder 2</span>

            <ChevronRight className="text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              Spreadsheet 3
            </span>

          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search within sheet"
                className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  console.log(`Search: ${e.target.value}`);
                }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-400" />
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">JD</span>
              </div>
              <span className="text-sm font-medium text-gray-700">
                John Doe
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Top Action Bar */}

      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToolbarAction("Tool bar")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded"
            >
              Tool bar
              <ChevronRight />

            </button>
            <button
              onClick={() => handleToolbarAction("Hide Fields")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <Eye className="w-4 h-4" />
              Hide Fields
            </button>
            <button
              onClick={() => handleToolbarAction("Sort")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <ArrowUpDown className="w-4 h-4" />
              Sort
            </button>
            <button
              onClick={() => handleToolbarAction("Filter")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button
              onClick={() => handleToolbarAction("Cell view")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
            >
              Cell view
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleToolbarAction("Import")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => handleToolbarAction("Export")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => handleToolbarAction("Share")}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 border border-gray-300 rounded-md"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => handleToolbarAction("New Action")}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
            >
              New Action
            </button>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th key={header.id} className="border border-gray-200 px-2 py-1">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => {
                const colId = cell.column.id;
                const isSelected = selected?.row === rowIndex && selected?.col === colId;
                return (
                  <td
                    key={cell.id}
                    className={`border px-2 py-1 border-gray-200 cursor-pointer ${isSelected ? "bg-blue-100" : ""}`}
                    onClick={() => setSelected({ row: rowIndex, col: colId })}
                    onDoubleClick={() => colId !== "id" && setEditing({ row: rowIndex, col: colId })}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-green-600 text-right">Status: Online</div>
    </div>
  );
};

export default Spreadsheet;
