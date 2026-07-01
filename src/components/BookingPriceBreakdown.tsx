import React from 'react'
import type { BookingPriceBreakdown as Breakdown } from '../lib/booking-pricing'
import { formatRupee } from '../lib/booking-pricing'

interface BookingPriceBreakdownProps {
  breakdown: Breakdown
  variant?: 'default' | 'compact' | 'inverse'
  className?: string
}

const BookingPriceBreakdown: React.FC<BookingPriceBreakdownProps> = ({
  breakdown,
  variant = 'default',
  className = '',
}) => {
  const isInverse = variant === 'inverse'
  const labelClass = isInverse ? 'text-white/90' : 'text-gray-600'
  const valueClass = isInverse ? 'text-white font-medium' : 'font-medium text-gray-900'
  const totalLabelClass = isInverse ? 'text-white font-semibold' : 'text-base font-semibold text-gray-900'
  const totalValueClass = isInverse
    ? 'text-2xl font-bold text-white'
    : 'text-xl font-bold text-blue-600'
  const dividerClass = isInverse ? 'border-white/30' : 'border-blue-300'

  if (variant === 'compact') {
    return (
      <dl className={`space-y-1.5 text-sm ${className}`}>
        <div className="flex justify-between gap-3">
          <dt className={labelClass}>
            Villa · {breakdown.nights} night{breakdown.nights !== 1 ? 's' : ''} (up to {breakdown.capacity}{' '}
            guests)
          </dt>
          <dd className={`${valueClass} tabular-nums`}>{formatRupee(breakdown.baseAmount)}</dd>
        </div>
        {breakdown.extraGuestsAmount > 0 && (
          <div className="flex justify-between gap-3">
            <dt className={labelClass}>
              Extra guests ({breakdown.extraGuests} × {formatRupee(breakdown.extraGuestPricePerNight)} ×{' '}
              {breakdown.nights} night{breakdown.nights !== 1 ? 's' : ''})
            </dt>
            <dd className={`${valueClass} tabular-nums`}>{formatRupee(breakdown.extraGuestsAmount)}</dd>
          </div>
        )}
        <div className={`border-t pt-2 flex justify-between gap-3 ${dividerClass}`}>
          <dt className={totalLabelClass}>Total</dt>
          <dd className={`${totalValueClass} tabular-nums`}>{formatRupee(breakdown.total)}</dd>
        </div>
      </dl>
    )
  }

  return (
    <dl className={`space-y-2 text-sm ${className}`}>
      <div className="flex justify-between gap-3">
        <dt className={labelClass}>
          Villa · {breakdown.nights} night{breakdown.nights !== 1 ? 's' : ''} (up to {breakdown.capacity} guests)
        </dt>
        <dd className={`${valueClass} tabular-nums`}>{formatRupee(breakdown.baseAmount)}</dd>
      </div>
      {breakdown.extraGuestsAmount > 0 && (
        <div className="flex justify-between gap-3">
          <dt className={labelClass}>
            Extra guests ({breakdown.extraGuests} × {formatRupee(breakdown.extraGuestPricePerNight)} ×{' '}
            {breakdown.nights} night{breakdown.nights !== 1 ? 's' : ''})
          </dt>
          <dd className={`${valueClass} tabular-nums`}>{formatRupee(breakdown.extraGuestsAmount)}</dd>
        </div>
      )}
      <div className={`border-t-2 pt-2 flex justify-between items-center gap-3 ${dividerClass}`}>
        <dt className={totalLabelClass}>Total</dt>
        <dd className={`${totalValueClass} tabular-nums`}>{formatRupee(breakdown.total)}</dd>
      </div>
    </dl>
  )
}

export default BookingPriceBreakdown
