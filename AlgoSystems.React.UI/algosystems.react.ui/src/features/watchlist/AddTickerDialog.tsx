import CloseIcon from '@mui/icons-material/Close'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useId, useMemo, useRef, useState, type FormEvent } from 'react'
import { useStockDirectory } from '@/features/stocks/api'
import { MARKETS } from '@/features/stocks/markets'
import type { Stock, StockKey } from '@/features/stocks/types'
import { notify } from '@/shared/notifications/notify'
import { resolveTicker, validateTicker } from './addTickerValidation'
import { useAddToWatchlistMutation } from './api'

interface AddTickerFormProps {
  watchedKeys: ReadonlySet<StockKey>
  submitting: boolean
  /** Resolves once the stock is added; rejects (and keeps the form open) if it isn't. */
  onSubmit: (stock: Stock) => Promise<void>
  onCancel: () => void
}

function AddTickerForm({ watchedKeys, submitting, onSubmit, onCancel }: AddTickerFormProps) {
  const directory = useStockDirectory()
  const [selected, setSelected] = useState<Stock | null>(null)
  const [text, setText] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)

  const options = useMemo(
    () =>
      [...(directory.data ?? [])].sort(
        (a, b) => a.market.localeCompare(b.market) || a.symbol.localeCompare(b.symbol),
      ),
    [directory.data],
  )

  // A typed ticker counts as chosen when it names exactly one stock.
  const stock = selected ?? resolveTicker(text, options)
  const error = validateTicker(text, stock, watchedKeys)
  // A duplicate is reported as soon as it's picked; other problems once Add is pressed.
  const shownError = submitAttempted || (stock && error) ? error : null

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return
    setSubmitAttempted(true)
    if (error || !stock) {
      inputRef.current?.focus()
      return
    }
    try {
      await onSubmit(stock)
    } catch {
      // The failure is reported by the app's error toast; keep the form so it can be retried.
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'contents' }}>
      <DialogContent dividers sx={{ display: 'grid', gap: 2 }}>
        <Alert severity="info" variant="outlined">
          Demo only: the stock is added in this browser session, and its prices are simulated.
          Reloading the page resets the watchlist.
        </Alert>
        <Autocomplete<Stock>
          options={options}
          value={selected}
          onChange={(_, next) => setSelected(next)}
          inputValue={text}
          onInputChange={(_, next, reason) => {
            setText(next)
            // Editing the text after picking a stock un-picks it.
            if (reason === 'input') setSelected(null)
          }}
          // Keep typed text on blur, so it can be looked up when Add is pressed.
          clearOnBlur={false}
          loading={directory.isPending}
          disabled={submitting}
          autoHighlight
          groupBy={(option) => MARKETS[option.market].label}
          getOptionLabel={(option) => `${option.symbol} — ${option.name}`}
          isOptionEqualToValue={(option, value) => option.key === value.key}
          noOptionsText="No demo stock matches"
          renderOption={({ key, ...props }, option) => (
            <li key={key} {...props}>
              <Box component="span" sx={{ fontWeight: 700, minWidth: 64 }}>
                {option.symbol}
              </Box>
              <Box component="span" sx={{ flex: 1, color: 'text.secondary' }}>
                {option.name}
              </Box>
              {watchedKeys.has(option.key) && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Watching
                </Typography>
              )}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Ticker or company"
              required
              autoFocus
              inputRef={inputRef}
              error={Boolean(shownError)}
              helperText={
                shownError ??
                (directory.isError
                  ? 'The stock list could not be loaded.'
                  : stock
                    ? `${stock.name} · ${MARKETS[stock.market].label} · ${stock.sector}`
                    : 'Search the demo stocks by ticker or company name.')
              }
            />
          )}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={submitting}>
          Add to watchlist
        </Button>
      </DialogActions>
    </Box>
  )
}

interface AddTickerDialogProps {
  open: boolean
  onClose: () => void
  watchedKeys: ReadonlySet<StockKey>
}

/**
 * Adds a stock to the demo watchlist. Closing discards the form (it remounts empty after the
 * dialog has closed), and is blocked while the stock is being added.
 */
export function AddTickerDialog({ open, onClose, watchedKeys }: AddTickerDialogProps) {
  const titleId = useId()
  const add = useAddToWatchlistMutation()
  const [formKey, setFormKey] = useState(0)

  const close = () => {
    if (!add.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullWidth
      maxWidth="xs"
      aria-labelledby={titleId}
      slotProps={{ transition: { onExited: () => setFormKey((k) => k + 1) } }}
    >
      <DialogTitle id={titleId} sx={{ pr: 7, fontWeight: 750 }}>
        Add ticker
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={close}
        disabled={add.isPending}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      <AddTickerForm
        key={formKey}
        watchedKeys={watchedKeys}
        submitting={add.isPending}
        onCancel={close}
        onSubmit={async (stock) => {
          // Resolves after the watchlist has been updated and refetched.
          await add.mutateAsync({ key: stock.key })
          notify.success(`Added ${stock.symbol} to the demo watchlist.`)
          onClose()
        }}
      />
    </Dialog>
  )
}
