import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useRef, useState, type FormEvent } from 'react'
import { useStockDirectory } from '@/features/stocks/api'
import type { FxRates } from '@/features/stocks/currency'
import { MARKETS } from '@/features/stocks/markets'
import type { Stock, StockKey } from '@/features/stocks/types'
import { todayIsoDate } from '@/shared/formatting/dates'
import { formatCurrency, formatPrice, type CurrencyCode } from '@/shared/formatting/format'
import {
  estimatedCost,
  initialAddHoldingValues,
  MAX_NOTE_LENGTH,
  toAddHoldingRequest,
  validateAddHolding,
  type AddHoldingField,
  type AddHoldingFormValues,
} from './addHoldingValidation'
import { averageCostFor } from './calculations'
import type { AddHoldingRequest } from './types'

const CURRENCIES: CurrencyCode[] = ['AUD', 'USD']

/** Fields in screen order, for moving focus to the first invalid one. */
const FIELD_ORDER: AddHoldingField[] = [
  'stock',
  'quantity',
  'price',
  'purchaseDate',
  'fees',
  'currency',
  'note',
]

export interface AddHoldingFormProps {
  baseCurrency: CurrencyCode
  fxRates: FxRates
  heldKeys: ReadonlySet<StockKey>
  submitting: boolean
  /** Resolves once the holding is saved; rejects (and keeps the form open) if it isn't. */
  onSubmit: (request: AddHoldingRequest) => Promise<void>
  onCancel: () => void
}

export function AddHoldingForm({
  baseCurrency,
  fxRates,
  heldKeys,
  submitting,
  onSubmit,
  onCancel,
}: AddHoldingFormProps) {
  const today = todayIsoDate()
  const directory = useStockDirectory()
  const [values, setValues] = useState<AddHoldingFormValues>(() =>
    initialAddHoldingValues(baseCurrency, today),
  )
  const [touched, setTouched] = useState<ReadonlySet<AddHoldingField>>(new Set())
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const fieldRefs = useRef<Partial<Record<AddHoldingField, HTMLInputElement | null>>>({})

  const errors = validateAddHolding(values, { heldKeys, today })
  const shownError = (field: AddHoldingField) =>
    submitAttempted || touched.has(field) ? errors[field] : undefined

  const set = <F extends AddHoldingField>(field: F, value: AddHoldingFormValues[F]) =>
    setValues((current) => ({ ...current, [field]: value }))
  const touch = (field: AddHoldingField) => setTouched((current) => new Set(current).add(field))
  const register = (field: AddHoldingField) => (element: HTMLInputElement | null) => {
    fieldRefs.current[field] = element
  }

  const options = useMemo(
    () =>
      [...(directory.data ?? [])].sort(
        (a, b) => a.market.localeCompare(b.market) || a.symbol.localeCompare(b.symbol),
      ),
    [directory.data],
  )

  const stock = values.stock
  const cost = estimatedCost(values)
  const converted = stock != null && stock.currency !== values.currency

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (submitting) return // A save is already in progress.
    setSubmitAttempted(true)

    const firstInvalid = FIELD_ORDER.find((field) => errors[field])
    if (firstInvalid) {
      fieldRefs.current[firstInvalid]?.focus()
      return
    }
    try {
      await onSubmit(toAddHoldingRequest(values))
    } catch {
      // The failure is reported by the app's error toast; keep the form so it can be retried.
    }
  }

  const amountAdornment = (
    <InputAdornment position="start">
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {values.currency}
      </Typography>
    </InputAdornment>
  )

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'contents' }}>
      <DialogContent dividers>
        <Box
          component="fieldset"
          disabled={submitting}
          sx={{
            border: 0,
            m: 0,
            p: 0,
            minWidth: 0,
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          }}
        >
          <Alert severity="info" variant="outlined" sx={{ gridColumn: '1 / -1' }}>
            Demo only: the holding is saved in this browser session, not sent to a server. Reloading
            the page resets the portfolio.
          </Alert>

          <Autocomplete<Stock>
            options={options}
            value={stock}
            onChange={(_, next) => {
              set('stock', next)
              touch('stock')
            }}
            loading={directory.isPending}
            disabled={submitting}
            autoHighlight
            groupBy={(option) => MARKETS[option.market].label}
            getOptionLabel={(option) => `${option.symbol} — ${option.name}`}
            isOptionEqualToValue={(option, selected) => option.key === selected.key}
            renderOption={({ key, ...props }, option) => (
              <li key={key} {...props}>
                <Box component="span" sx={{ fontWeight: 700, minWidth: 64 }}>
                  {option.symbol}
                </Box>
                <Box component="span" sx={{ flex: 1, color: 'text.secondary' }}>
                  {option.name}
                </Box>
                {heldKeys.has(option.key) && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Held
                  </Typography>
                )}
              </li>
            )}
            sx={{ gridColumn: '1 / -1' }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Stock symbol"
                required
                autoFocus
                inputRef={register('stock')}
                onBlur={() => touch('stock')}
                error={Boolean(shownError('stock'))}
                helperText={
                  shownError('stock') ??
                  (directory.isError
                    ? 'The stock list could not be loaded.'
                    : 'Search by ticker or company name.')
                }
              />
            )}
          />

          <TextField
            label="Company name"
            value={stock?.name ?? ''}
            placeholder="Filled in from the symbol"
            helperText={
              stock
                ? `${MARKETS[stock.market].label} · trades in ${stock.currency}`
                : 'Filled in from the demo symbol list.'
            }
            slotProps={{ input: { readOnly: true }, inputLabel: { shrink: true } }}
            sx={{ gridColumn: '1 / -1' }}
          />

          <TextField
            label="Quantity"
            required
            value={values.quantity}
            onChange={(e) => set('quantity', e.target.value)}
            onBlur={() => touch('quantity')}
            inputRef={register('quantity')}
            error={Boolean(shownError('quantity'))}
            helperText={shownError('quantity') ?? 'Number of shares'}
            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
          />

          <TextField
            label="Average purchase price"
            required
            value={values.price}
            onChange={(e) => set('price', e.target.value)}
            onBlur={() => touch('price')}
            inputRef={register('price')}
            error={Boolean(shownError('price'))}
            helperText={
              shownError('price') ??
              (converted
                ? `In ${values.currency}; converted to ${stock.currency} at the demo rate.`
                : 'Per share')
            }
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { startAdornment: amountAdornment },
            }}
          />

          <TextField
            label="Purchase date"
            type="date"
            value={values.purchaseDate}
            onChange={(e) => set('purchaseDate', e.target.value)}
            onBlur={() => touch('purchaseDate')}
            inputRef={register('purchaseDate')}
            error={Boolean(shownError('purchaseDate'))}
            helperText={shownError('purchaseDate')}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today } }}
          />

          <TextField
            label="Transaction fees"
            value={values.fees}
            onChange={(e) => set('fees', e.target.value)}
            onBlur={() => touch('fees')}
            inputRef={register('fees')}
            error={Boolean(shownError('fees'))}
            helperText={shownError('fees') ?? 'Brokerage and other costs'}
            slotProps={{
              htmlInput: { inputMode: 'decimal' },
              input: { startAdornment: amountAdornment },
            }}
          />

          <TextField
            select
            label="Currency"
            value={values.currency}
            onChange={(e) => set('currency', e.target.value as CurrencyCode)}
            inputRef={register('currency')}
            helperText={`Of the price and fees. The portfolio is in ${baseCurrency}.`}
          >
            {CURRENCIES.map((code) => (
              <MenuItem key={code} value={code}>
                {code}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes"
            multiline
            minRows={2}
            value={values.note}
            onChange={(e) => set('note', e.target.value)}
            onBlur={() => touch('note')}
            inputRef={register('note')}
            error={Boolean(shownError('note'))}
            helperText={shownError('note') ?? `Optional · ${values.note.length}/${MAX_NOTE_LENGTH}`}
            sx={{ gridColumn: '1 / -1' }}
          />

          <Box
            role="status"
            sx={{
              gridColumn: '1 / -1',
              p: 2,
              borderRadius: '10px',
              bgcolor: 'surface.raised',
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Estimated cost (quantity × price + fees)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 750 }}>
                {formatCurrency(cost, { currency: values.currency, decimals: 2 })}
              </Typography>
            </Box>
            {converted && cost != null && !errors.quantity && (
              <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 1 }}>
                Recorded as an average cost of{' '}
                {formatPrice(
                  averageCostFor(toAddHoldingRequest(values), stock.currency, fxRates),
                  stock.currency,
                )}{' '}
                per share, at the demo rate of 1 USD = {fxRates.USD} AUD.
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancel} disabled={submitting} color="inherit">
          Cancel
        </Button>
        <Button type="submit" variant="contained" loading={submitting}>
          Add holding
        </Button>
      </DialogActions>
    </Box>
  )
}
