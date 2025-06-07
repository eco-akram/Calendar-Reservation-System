"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  getFilteredRowModel,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { type Reservations, deleteReservations } from "@/lib/actions";
import { format, isWithinInterval } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";
import ExcelJS from 'exceljs';
import { toast } from "sonner";

const columns: ColumnDef<Reservations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customer_name",
    header: "Kliento vardas",
  },
  {
    accessorKey: "customer_email",
    header: "El. paštas",
  },
  {
    accessorKey: "customer_phone",
    header: "Telefonas",
  },
  {
    accessorKey: "start_time",
    header: "Pradžios laikas",
    cell: ({ row }) => format(new Date(row.getValue("start_time")), "PPp"),
  },
  {
    accessorKey: "end_time",
    header: "Pabaigos laikas",
    cell: ({ row }) => format(new Date(row.getValue("end_time")), "PPp"),
  },
  {
    accessorKey: "custom_field_1",
    header: "Papildomas laukas 1",
  },
  {
    accessorKey: "custom_field_2",
    header: "Papildomas laukas 2",
  },
  {
    accessorKey: "custom_field_3",
    header: "Papildomas laukas 3",
  },
  {
    accessorKey: "custom_field_4",
    header: "Papildomas laukas 4",
  },
];

interface DataTableProps {
  data: Reservations[];
}

export function ReservationsTable({ data }: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedCalendar, setSelectedCalendar] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get unique calendar IDs from data
  const calendarIds = useMemo(() => 
    Array.from(new Set(data.map((item) => item.calendar_id))),
    [data]
  );

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    setIsLoading(true);
    const filtered = data.filter((item) => {
      if (filterType === "date" && (dateRange.from || dateRange.to)) {
        const itemDate = new Date(item.start_time);
        if (dateRange.from && dateRange.to) {
          return isWithinInterval(itemDate, {
            start: dateRange.from,
            end: dateRange.to,
          });
        } else if (dateRange.from) {
          return itemDate >= dateRange.from;
        } else if (dateRange.to) {
          return itemDate <= dateRange.to;
        }
      }
      if (filterType === "calendar" && selectedCalendar !== "all") {
        return item.calendar_id === selectedCalendar;
      }
      return true;
    });
    setIsLoading(false);
    return filtered;
  }, [data, filterType, dateRange, selectedCalendar]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    manualPagination: true,
    pageCount: Math.ceil(filteredData.length / 10),
  });

  const handleFilterTypeChange = (value: string) => {
    setIsLoading(true);
    setFilterType(value);
    // Reset other filters when changing filter type
    if (value !== "date") {
      setDateRange({ from: undefined, to: undefined });
    }
    if (value !== "calendar") {
      setSelectedCalendar("all");
    }
    setIsLoading(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const sortedRows = table.getSortedRowModel().rows;
    const selectedSortedRows = sortedRows.filter(row => row.getIsSelected());

    if (selectedSortedRows.length === 0) {
      setIsDownloading(false);
      return;
    }

    const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() && column.id !== 'select');

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reservations');

    // Add headers
    const headers = visibleColumns.map(column => column.columnDef.header as string);
    const headerRow = worksheet.addRow(headers);

    // Apply bold font and background color to header cells
    headerRow.eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD966' }, // A light yellow color
      };
    });

    // Set column widths
    worksheet.columns.forEach((column, i) => {
      const columnDef = visibleColumns[i];
      const headerText = headers[i];

      // Set different widths based on column ID
      if (columnDef.id === 'customer_name' || columnDef.id === 'customer_phone') {
        column.width = Math.max(headerText.length + 2, 15); // A moderate width for name and phone
      } else if (columnDef.id.startsWith('custom_field_')) {
         column.width = Math.max(headerText.length + 2, 40); // Wider for custom fields
      }
      else {
        column.width = Math.max(headerText.length + 2, 25); // Default width for other columns
      }
    });

    // Add data rows
    selectedSortedRows.forEach(row => {
      const rowData: (string | number | boolean | null)[] = [];
      visibleColumns.forEach(column => {
        const value = row.getValue(column.id);
        let formattedValue: string | number | boolean | null = value as string | number | boolean | null;

        // Format dates if they are date values
        if (column.id === 'start_time' || column.id === 'end_time') {
          formattedValue = format(new Date(value as string), "yyyy-MM-dd HH:mm:ss");
        }

        // Handle null or undefined explicitly for Excel
        rowData.push(formattedValue === null || formattedValue === undefined ? '' : formattedValue);
      });
      worksheet.addRow(rowData);
    });

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Create a Blob and trigger download
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object

    setIsDownloading(false);
  };

  const handleDeleteSelected = async () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) {
      toast.error("Nepasirinkta jokių rezervacijų");
      return;
    }

    try {
      setIsDeleting(true);
      const selectedIds = selectedRows.map(row => row.original.id);
      await deleteReservations(selectedIds);
      toast.success(`Sėkmingai ištrinta ${selectedIds.length} rezervacija(ų)`);
      setRowSelection({});
      // Refresh the page to update the data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting reservations:', error);
      toast.error("Nepavyko ištrinti rezervacijų");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filtruoti pagal kliento vardą..."
            value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("customer_name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            value={filterType}
            onValueChange={handleFilterTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtruoti pagal..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Visi</SelectItem>
              <SelectItem value="date">Datos intervalas</SelectItem>
              <SelectItem value="calendar">Kalendorius</SelectItem>
            </SelectContent>
          </Select>

          {filterType === "date" && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pasirinkite datų intervalą</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range: DateRange | undefined) => {
                      setIsLoading(true);
                      setDateRange({
                        from: range?.from,
                        to: range?.to
                      });
                      setIsLoading(false);
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {filterType === "calendar" && (
            <Select
              value={selectedCalendar}
              onValueChange={(value) => {
                setIsLoading(true);
                setSelectedCalendar(value);
                setIsLoading(false);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pasirinkite kalendorių" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Visi kalendoriai</SelectItem>
                {calendarIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    Kalendorius {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto font-normal" disabled={isLoading || isDownloading}>
                Stulpeliai
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
{/*           <Button
            variant="outline"
            size="icon"
            onClick={handleDownload}
            disabled={isLoading || isDownloading || table.getSelectedRowModel().rows.length === 0}
          >
            {isDownloading ? "..." : <Download className="h-4 w-4" />}
          </Button> */}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isLoading || isDeleting || table.getSelectedRowModel().rows.length === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Ištrinti pasirinktus
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isLoading || isDownloading || table.getSelectedRowModel().rows.length === 0}
          >
            {isDownloading ? "..." : <Download className="h-4 w-4 mr-2" />}
            Eksportuoti
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Kraunama...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nieko nerasta.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage() || isLoading}
        >
          Ankstesnis
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isLoading}
        >
          Kitas
        </Button>
      </div>
    </div>
  );
} 