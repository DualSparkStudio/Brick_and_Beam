# Booking Form Layout Fix

## Issue
Large empty space on the left side of the booking form in mobile/tablet view.

## Solution
Restructure the layout to display:
1. Room Details - Horizontally at the top (image on left, info on right)
2. Booking Form - Full width below the room details

## Changes Needed in src/pages/BookingForm.tsx

Around line 807-820, change the layout from:
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Room Details - Left Column */}
  {/* Booking Form - Right Column */}
</div>
```

To:
```tsx
{/* Room Details - Horizontal at top */}
<div className="mb-8">
  <h2>Room Details</h2>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Image - 1 column */}
    {/* Info - 2 columns */}
  </div>
</div>

{/* Booking Form - Full width below */}
<div>
  <h2>Booking Details</h2>
  {/* Form fields */}
</div>
```

## Key Changes:
1. Remove `lg:grid-cols-2` layout
2. Add horizontal room details section with `md:grid-cols-3`
3. Make booking form full-width
4. Remove extra boxes (amenities, why book, need help) from left side
5. Keep only essential info in room details

This eliminates the empty space and creates a better mobile experience.
