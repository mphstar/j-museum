import { Table } from "@tanstack/react-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "./input"
import  { JSX, ReactElement } from "react"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  action?:  React.ReactNode
}

export function HeadTablePagination<TData>({
  table,
  action
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex md:items-center flex-col-reverse md:flex-row w-full gap-2 justify-between overflow-x-auto">
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          {/* <p className="text-sm font-medium">Rows per page</p> */}
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value))
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center gap-2">
        {action}
        <Input
            placeholder="Cari data..."
            value={table.getState().globalFilter ?? ""}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
            className="w-full min-w-[150px] whitespace-nowrap"
            />
      </div>
    </div>
  )
}
