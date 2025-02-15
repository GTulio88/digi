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
const formatDateBR = (date) => {
  if (!date || typeof date !== "string") return "Data inválida";
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
};

const TableComponent = ({ data, onEdit, onDelete }) => {
  const [filter, setFilter] = useState("");

  const filteredData = useMemo(() => {
    // Ordenar os dados por data decrescente
    const sortedData = [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA; // Decrescente
    });

    // Mapeamento de meses para facilitar a busca
    const monthsMap = [
      "jan",
      "fev",
      "mar",
      "abr",
      "mai",
      "jun",
      "jul",
      "ago",
      "set",
      "out",
      "nov",
      "dez",
    ];

    return sortedData.filter((item) => {
      const [year, month] = item.date.split("-"); // Extrai ano e mês do formato yyyy-mm-dd
      const filterLower = filter.toLowerCase();

      // Encontra o nome do mês a partir do número
      const monthName = monthsMap[parseInt(month, 10) - 1];

      return (
        item.date.includes(filter) || // Filtra por data completa
        item.clientId.includes(filter) || // Filtra por ID do cliente
        (monthName && monthName.startsWith(filterLower)) // Filtra por início do nome do mês
      );
    });
  }, [data, filter]);
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const columns = [
    columnHelper.accessor("date", {
      header: "Data",
      cell: (info) => formatDateBR(info.getValue()) || "Sem data",
    }),
    columnHelper.accessor("clientId", {
      header: "ID Cliente",
    }),
    columnHelper.accessor("clientAddress", {
      header: "Endereço",
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue() || "Sem status",
    }),
    columnHelper.accessor("notes", {
      header: "Observações",
      cell: (info) => info.getValue() || "Sem observações",
    }),
    columnHelper.display({
      header: "Ações",
      cell: (info) => (
        <div className="action-buttons">
          <button
            className="btn-edit"
            onClick={() => onEdit(info.row.original)}
          >
            Editar
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(info.row.original)}
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
