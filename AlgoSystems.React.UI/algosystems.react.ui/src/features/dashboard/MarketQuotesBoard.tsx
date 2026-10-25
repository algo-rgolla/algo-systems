import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import { Fragment } from 'react'
import { SignedValue } from '@/shared/components/SignedValue'
import { formatChange, formatPercent, formatPrice } from '@/shared/formatting/format'
import type { MarketQuote, MarketQuoteGroup } from './types'

const GROUPS: MarketQuoteGroup[] = ['Indices', 'Futures']

const NUMERIC_COLUMNS = ['Value', 'Change', 'Chg%', 'Open', 'High', 'Low', 'Prev']

const cellSx = { px: '10px', py: '11px', borderColor: 'line.subtle', whiteSpace: 'nowrap' }

/**
 * A fixed six-row quote board in the TradingView widget's layout (grouped rows, one header).
 * It is not a data-heavy list, so it uses a plain table rather than the Data Grid.
 */
export function MarketQuotesBoard({ quotes }: { quotes: MarketQuote[] }) {
  return (
    <Box sx={{ overflowX: 'auto', overscrollBehaviorX: 'contain' }}>
      <Table size="small" sx={{ minWidth: 620, fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
        <TableHead>
          <TableRow>
            {['Name', ...NUMERIC_COLUMNS].map((heading, i) => (
              <TableCell
                key={heading}
                align={i === 0 ? 'left' : 'right'}
                sx={{
                  ...cellSx,
                  py: '12px',
                  borderColor: 'line.strong',
                  color: 'text.tableHeader',
                  fontSize: '0.625rem',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                }}
              >
                {heading}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody sx={{ '& td': { fontSize: 'inherit', ...cellSx } }}>
          {GROUPS.map((group) => (
            <Fragment key={group}>
              <TableRow>
                <TableCell
                  colSpan={NUMERIC_COLUMNS.length + 1}
                  component="th"
                  scope="rowgroup"
                  sx={{
                    ...cellSx,
                    bgcolor: 'surface.raised',
                    color: 'text.label',
                    fontWeight: 700,
                    fontSize: '0.6875rem',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  {group}
                </TableCell>
              </TableRow>
              {quotes
                .filter((q) => q.group === group)
                .map((q) => (
                  <TableRow key={q.symbol} hover>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ ...cellSx, fontSize: 'inherit', fontWeight: 700 }}
                    >
                      {q.name}
                    </TableCell>
                    <TableCell align="right">{formatPrice(q.value)}</TableCell>
                    <TableCell align="right">
                      <SignedValue value={q.change} format={(v) => formatChange(v)} />
                    </TableCell>
                    <TableCell align="right">
                      <SignedValue value={q.changePercent} format={formatPercent} />
                    </TableCell>
                    <TableCell align="right">{formatPrice(q.open)}</TableCell>
                    <TableCell align="right">{formatPrice(q.high)}</TableCell>
                    <TableCell align="right">{formatPrice(q.low)}</TableCell>
                    <TableCell align="right">{formatPrice(q.previousClose)}</TableCell>
                  </TableRow>
                ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
