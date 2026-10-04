import { alpha, useTheme } from '@mui/material/styles'
import { DataGrid, type DataGridProps, type GridValidRowModel } from '@mui/x-data-grid'

type DataTableProps<R extends GridValidRowModel> = DataGridProps<R> & {
  /** Fixed height of the grid viewport. Rows virtualise inside it. */
  height?: number | string
}

/**
 * The app's single data grid. Applies terminal-style density and borders so
 * feature tables only describe their columns and rows.
 */
export function DataTable<R extends GridValidRowModel>({
  height = 560,
  sx,
  ...props
}: DataTableProps<R>) {
  const theme = useTheme()

  return (
    <DataGrid<R>
      density="compact"
      disableRowSelectionOnClick
      disableColumnMenu
      showToolbar
      pageSizeOptions={[25, 50, 100]}
      initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
      {...props}
      sx={[
        {
          height,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          '--DataGrid-containerBackground': theme.palette.background.paper,
          '--DataGrid-rowBorderColor': theme.palette.divider,
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '0.6875rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          },
          '& .MuiDataGrid-row:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
          '& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within': {
            outline: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    />
  )
}
