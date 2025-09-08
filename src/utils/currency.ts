export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const formatRupiahShort = (amount: number): string => {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}B`
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(1)}K`
  }
  return formatRupiah(amount)
}