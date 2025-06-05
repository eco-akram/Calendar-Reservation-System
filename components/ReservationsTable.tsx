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
import { type Reservations } from "@/lib/actions";
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
import { Download, CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Checkbox } from "@/components/ui/checkbox";

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
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customer_name",
    header: "Customer Name",
  },
  {
    accessorKey: "customer_email",
    header: "Email",
  },
  {
    accessorKey: "customer_phone",
    header: "Phone",
  },
  {
    accessorKey: "start_time",
    header: "Start Time",
    cell: ({ row }) => format(new Date(row.getValue("start_time")), "PPp"),
  },
  {
    accessorKey: "end_time",
    header: "End Time",
    cell: ({ row }) => format(new Date(row.getValue("end_time")), "PPp"),
  },
  {
    accessorKey: "custom_field_1",
    header: "Custom Field 1",
  },
  {
    accessorKey: "custom_field_2",
    header: "Custom Field 2",
  },
  {
    accessorKey: "custom_field_3",
    header: "Custom Field 3",
  },
  {
    accessorKey: "custom_field_4",
    header: "Custom Field 4",
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

  const handleDownload = () => {
    const selectedRows = table.getSelectedRowModel().rows;
    if (selectedRows.length === 0) return;

    // Get visible columns
    const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible());
    
    // Create CSV header
    const headers = visibleColumns.map(column => column.id).join(',');
    
    // Create CSV rows
    const rows = selectedRows.map(row => {
      return visibleColumns.map(column => {
        const value = row.getValue(column.id);
        // Format dates if they are date values
        if (column.id === 'start_time' || column.id === 'end_time') {
          return format(new Date(value as string), "yyyy-MM-dd HH:mm:ss");
        }
        // Escape commas and quotes in the value
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    }).join('\n');

    // Combine header and rows
    const csv = `${headers}\n${rows}`;
    
    // Create and download the file
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservations_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Filter by customer name..."
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
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="date">Date & Time</SelectItem>
              <SelectItem value="calendar">Calendar</SelectItem>
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
                      <span>Pick a date range</span>
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
                <SelectValue placeholder="Select calendar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Calendars</SelectItem>
                {calendarIds.map((id) => (
                  <SelectItem key={id} value={id}>
                    Calendar {id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto" disabled={isLoading}>
                Columns
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
          <Button 
            variant="outline" 
            size="icon" 
            disabled={isLoading || table.getSelectedRowModel().rows.length === 0}
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
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
                  Loading...
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
                  No results.
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
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage() || isLoading}
        >
          Next
        </Button>
      </div>
    </div>
  );
} 