import { useState } from "react"
import { TransactionType } from "@/pages/Spending"
import { IncomeForm } from "@/components/IncomeForm"
import { SpendingMethodSelector } from "@/components/SpendingMethodSelector"
import { SpendingForm } from "@/components/SpendingForm"
import { PhotoUploadForm } from "@/components/PhotoUploadForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transactionType: TransactionType
  onSuccess: () => void
}

type SpendingMethod = 'manual' | 'photo'

export function TransactionModal({ isOpen, onClose, transactionType, onSuccess }: TransactionModalProps) {
  const [spendingMethod, setSpendingMethod] = useState<SpendingMethod>('manual')

  const handleSuccess = () => {
    onSuccess()
    setSpendingMethod('manual') // Reset method for next time
  }

  const renderContent = () => {
    if (transactionType === 'income') {
      return <IncomeForm onSuccess={handleSuccess} onCancel={onClose} />
    }

    if (spendingMethod === 'manual') {
      return <SpendingForm onSuccess={handleSuccess} onCancel={onClose} />
    }

    if (spendingMethod === 'photo') {
      return <PhotoUploadForm onSuccess={handleSuccess} onCancel={onClose} />
    }

    return <SpendingMethodSelector onMethodSelect={setSpendingMethod} />
  }

  const getTitle = () => {
    if (transactionType === 'income') return 'Add Income'
    if (spendingMethod === 'manual') return 'Add Spending (Manual)'
    if (spendingMethod === 'photo') return 'Add Spending (Photo)'
    return 'Choose Spending Method'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}