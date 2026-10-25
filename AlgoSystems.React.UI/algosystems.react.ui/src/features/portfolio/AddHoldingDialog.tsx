import CloseIcon from '@mui/icons-material/Close'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useId, useMemo, useState } from 'react'
import { notify } from '@/shared/notifications/notify'
import { AddHoldingForm } from './AddHoldingForm'
import { useAddHoldingMutation } from './api'
import type { Portfolio } from './types'

interface AddHoldingDialogProps {
  open: boolean
  onClose: () => void
  portfolio: Portfolio
}

/**
 * Adds a holding to the demo portfolio. Closing (Cancel, the close button, Escape or the
 * backdrop) discards the form: it remounts empty after the dialog has closed. Closing is blocked
 * while a save is in progress.
 */
export function AddHoldingDialog({ open, onClose, portfolio }: AddHoldingDialogProps) {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const titleId = useId()
  const add = useAddHoldingMutation()
  const [formKey, setFormKey] = useState(0)

  const heldKeys = useMemo(
    () => new Set(portfolio.holdings.map((h) => h.stock.key)),
    [portfolio.holdings],
  )

  const close = () => {
    if (!add.isPending) onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={close}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      aria-labelledby={titleId}
      slotProps={{ transition: { onExited: () => setFormKey((k) => k + 1) } }}
    >
      <DialogTitle id={titleId} sx={{ pr: 7, fontWeight: 750 }}>
        Add holding
      </DialogTitle>
      <IconButton
        aria-label="Close"
        onClick={close}
        disabled={add.isPending}
        sx={{ position: 'absolute', right: 12, top: 12 }}
      >
        <CloseIcon />
      </IconButton>
      <AddHoldingForm
        key={formKey}
        baseCurrency={portfolio.baseCurrency}
        fxRates={portfolio.fxRates}
        heldKeys={heldKeys}
        submitting={add.isPending}
        onCancel={close}
        onSubmit={async (request) => {
          // Resolves after the portfolio has been updated and refetched.
          const holding = await add.mutateAsync(request)
          notify.success(`Added ${holding.stock.symbol} to the demo portfolio.`)
          onClose()
        }}
      />
    </Dialog>
  )
}
