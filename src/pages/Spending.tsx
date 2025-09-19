import { useState } from "react"
import { FloatingActionButton } from "@/components/FloatingActionButton"
import { TransactionList } from "@/components/TransactionList"
import { TransactionModal } from "@/components/TransactionModal"
import { AddSpendingForm } from "@/components/AddSpendingForm"

export type TransactionType = 'income' | 'spending'
export type TransactionMethod = 'manual' | 'photo'

export interface TransactionData {
  name: string
  amount: number
  category_id?: string
  notes?: string
  date: Date
  type: TransactionType
  method: TransactionMethod
  photo_url?: string
}

const Spending = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [transactionType, setTransactionType] = useState<TransactionType>('spending')
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleFabClick = (type: TransactionType) => {
    setTransactionType(type)
    setShowAddForm(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
  }

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
    setIsModalOpen(false)
    setShowAddForm(false)
  }

  const handleBackFromForm = () => {
    setShowAddForm(false)
  }

  if (showAddForm) {
    return (
      <AddSpendingForm 
        onSuccess={handleTransactionSuccess}
        onBack={handleBackFromForm}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Spending Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your income and expenses
            </p>
          </div>
        </div>

        {/* Transaction List */}
        <TransactionList key={refreshTrigger} />

        {/* Floating Action Button */}
        <FloatingActionButton onAddIncome={() => handleFabClick('income')} onAddSpending={() => handleFabClick('spending')} />

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          transactionType={transactionType}
          onSuccess={handleTransactionSuccess}
        />
      </div>
    </div>
  )
}

export default Spending