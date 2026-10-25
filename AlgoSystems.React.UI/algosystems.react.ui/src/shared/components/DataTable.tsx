import { DataGrid, type DataGridProps, type GridValidRowModel } from '@mui/x-data-grid'

const DEFAULT_PAGE_SIZE = 25

type DataTableProps<R extends GridValidRowModel> = DataGridProps<R> & {
  /** Fixed viewport height, for long lists that should virtualise. Omit to fit the rows. */
  height?: number | string
}

/**
 * The app's single data grid. Its look (borderless, uppercase headers, row rules) comes from the
 * theme's MuiDataGrid overrides; this sets behaviour defaults so features only describe columns
 * and rows. The pagination footer appears only when there is more than one page.
 */
export function DataTable<R extends GridValidRowModel>({
  height,
  rows = [],
  initialState,
  sx,
  ...props
}: DataTableProps<R>) {
  const pageSize = initialState?.pagination?.paginationModel?.pageSize ?? DEFAULT_PAGE_SIZE

  return (
    <DataGrid<R>
      rows={rows}
      autoHeight={height === undefined}
      rowHeight={56}
      columnHeaderHeight={40}
      disableRowSelectionOnClick
      disableColumnMenu
      hideFooter={rows.length <= pageSize}
      pageSizeOptions={[25, 50, 100]}
      initialState={{
        ...initialState,
        pagination: {
          ...initialState?.pagination,
          paginationModel: { ...initialState?.pagination?.paginationModel, pageSize },
        },
      }}
      {...props}
      sx={[height !== undefined && { height }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  )
}
