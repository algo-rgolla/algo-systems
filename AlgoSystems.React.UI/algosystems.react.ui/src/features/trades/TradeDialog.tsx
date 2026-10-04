import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState, type FormEvent } from 'react'
import type { AlgoProductRequestDto } from '@/api/types/dtos'
import type { StockRow } from '@/features/stocks/model'
import { formatPrice } from '@/shared/formatting/format'
import { notify } from '@/shared/notifications/notify'
import { useSaveTrade } from './api'

/** Opening a new position, or closing an existing one. */
export type TradeDialogMode = { kind: 'open' } | { kind: 'close'; trade: StockRow }

interface TradeDialogProps {
  mode: TradeDialogMode | null
  onClose: () => void
}

export function TradeDialog({ mode, onClose }: TradeDialogProps) {
  return (
    <Dialog open={mode !== null} onClose={onClose} maxWidth="xs" fullWidth>
      {/* Keyed so the form state resets every time the dialog opens. */}
      {mode && (
        <TradeForm
          key={mode.kind === 'close' ? mode.trade.rowKey : 'open'}
          mode={mode}
          onClose={onClose}
        />
      )}
    </Dialog>
  )
}

const ASX_CODE = /^[A-Z0-9]{3}$/

function TradeForm({ mode, onClose }: { mode: TradeDialogMode; onClose: () => void }) {
  const save = useSaveTrade()
  const closing = mode.kind === 'close' ? mode.trade : null

  const [symbol, setSymbol] = useState(closing?.symbol ?? '')
  const [volume, setVolume] = useState(closing?.volume?.toString() ?? '')
  const [openPrice, setOpenPrice] = useState(closing?.openPrice?.toString() ?? '')
  const [closePrice, setClosePrice] = useState(closing?.close?.toString() ?? '')
  const [submitted, setSubmitted] = useState(false)

  const errors = {
    symbol: ASX_CODE.test(symbol) ? null : 'Enter a 3-character ASX code',
    volume: Number.isInteger(Number(volume)) && Number(volume) > 0 ? null : 'Whole number above 0',
    openPrice: Number(openPrice) > 0 ? null : 'Price above 0',
    closePrice: !closing || Number(closePrice) > 0 ? null : 'Price above 0',
  }
  const isValid = Object.values(errors).every((e) => e === null)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!isValid) return

    const request: AlgoProductRequestDto = closing
      ? {
          algoPortfolioId: closing.portfolioId,
          symbol,
          volume: Number(volume),
          action: 'Sell',
          // The API validates OpenPrice on every request, including closes.
          openPrice: Number(openPrice),
          closePrice: Number(closePrice),
        }
      : {
          algoPortfolioId: 0,
          symbol,
          volume: Number(volume),
          action: 'Buy',
          openPrice: Number(openPrice),
        }

    save.mutate(request, {
      onSuccess: () => {
        notify.success(closing ? `Closed ${symbol}` : `Opened ${symbol}`)
        onClose()
      },
    })
  }

  const show = (field: keyof typeof errors) => (submitted ? errors[field] : null)

  return (
    <form onSubmit={handleSubmit} noValidate>
      <DialogTitle>{closing ? `Close ${closing.symbol}` : 'Record a trade'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="ASX code"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase().trim())}
            disabled={Boolean(closing)}
            error={Boolean(show('symbol'))}
            helperText={show('symbol')}
            slotProps={{ htmlInput: { maxLength: 3, autoCapitalize: 'characters' } }}
            autoFocus={!closing}
            required
          />
          <TextField
            label="Quantity"
            type="number"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
            disabled={Boolean(closing)}
            error={Boolean(show('volume'))}
            helperText={show('volume')}
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            required
          />
          <TextField
            label="Entry price"
            type="number"
            value={openPrice}
            onChange={(e) => setOpenPrice(e.target.value)}
            disabled={Boolean(closing)}
            error={Boolean(show('openPrice'))}
            helperText={show('openPrice')}
            slotProps={{ htmlInput: { min: 0, step: 0.001 } }}
            required
          />
          {closing && (
            <TextField
              label="Exit price"
              type="number"
              value={closePrice}
              onChange={(e) => setClosePrice(e.target.value)}
              error={Boolean(show('closePrice'))}
              helperText={show('closePrice') ?? `Last close ${formatPrice(closing.close)}`}
              slotProps={{ htmlInput: { min: 0, step: 0.001 } }}
              autoFocus
              required
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={save.isPending} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={save.isPending}>
          {closing ? 'Close position' : 'Save trade'}
        </Button>
      </DialogActions>
    </form>
  )
}
