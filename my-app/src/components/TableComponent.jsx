import React, { useState, useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const columnHelper = createColumnHelper();

const TableComponent = ({ data, onEdit, onDelete }) => {
  const [filter, setFilter] = useState("");

  // UseMemo para memoizar os dados filtrados
  const filteredData = useMemo(() => {
    return data.filter(
      (item) => item.date.includes(filter) || item.clientId.includes(filter)
    );
  }, [data, filter]); // Recalcula apenas quando `data` ou `filter` mudarem

  const columns = [
    columnHelper.accessor("date", {
      header: "Data",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("hoursWorked", {
      header: "Hs",
    }),
    columnHelper.accessor("clientId", {
      header: "ID",
    }),
    columnHelper.accessor("clientAddress", {
      header: "Endereço",
    }),
    columnHelper.accessor("serviceType", {
      header: "Serviço",
    }),
    columnHelper.accessor("status", {
      header: "Status",
    }),
    columnHelper.accessor("notes", {
      header: "Observação",
    }),
    columnHelper.display({
      header: "Ações",
      cell: (info) => (
        <div className="action-buttons">
          <button
            className="btn-edit"
            onClick={() => onEdit(info.row.original)} // Chama handleEdit
          >
            Editar
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(info.row.original)} // Chama handleDelete
          >
            Excluir
          </button>
        </div>
      ),
    }),
  ];

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="table-responsive">
      {/* Campo de Filtro */}
      <input
        type="text"
        placeholder="Filtrar por data ou ID"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="filter-input"
      />
      <table className="futuristic-table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="pagination-button"
        >
          <FaArrowLeft />
        </button>
        <span>
          Página{" "}
          <strong>
            {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </strong>
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="pagination-button"
        >
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

export default TableComponent;
