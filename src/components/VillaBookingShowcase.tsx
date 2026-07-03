import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  HomeModernIcon,
  MapPinIcon,
  SparklesIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useVilla } from '../contexts/VillaContext'
import { getDefaultVillaImages, resolveRoomImages } from '../lib/room-images'
import { formatCheckInFromLabel } from '../lib/villa-check-times'
import { api, type Room } from '../lib/supabase'
import { formatRupee, resolveVillaNightlyRates } from '../lib/villa-pricing'

interface VillaBookingShowcaseProps {
  room: Room | null
  loading?: boolean
}

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
})

const VillaBookingShowcase: React.FC<VillaBookingShowcaseProps> = ({ room, loading }) => {
  const { checkTimes } = useVilla()
  const [images, setImages] = useState<string[]>([])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (loading || !room) {
      setImages([])
      setActiveImageIndex(0)
      return
    }

    let cancelled = false

    const loadImages = async () => {
      let roomImageRecords = null
      try {
        roomImageRecords = await api.getRoomImages(room.id)
      } catch {
        roomImageRecords = null
      }

      if (!cancelled) {
        const resolved = resolveRoomImages(room, roomImageRecords)
        setImages(resolved.length > 0 ? resolved : getDefaultVillaImages())
        setActiveImageIndex(0)
      }
    }

    void loadImages()
    return () => {
      cancelled = true
    }
  }, [room, loading])

  if (loading) {
    return (
      <section className="relative overflow-hidden bg-dark-blue-900 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="aspect-[4/5] animate-pulse rounded-3xl bg-white/10 lg:aspect-auto lg:min-h-[520px]" />
            <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="h-8 w-2/3 animate-pulse rounded bg-white/10" />
              <div className="h-4 w-full animate-pulse rounded bg-white/10" />
              <div className="h-4 w-4/5 animate-pulse rounded bg-white/10" />
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 animate-pulse rounded-xl bg-white/10" />
                ))}
              </div>
              <div className="h-14 animate-pulse rounded-xl bg-white/10" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!room) {
    return (
      <section className="bg-dark-blue-900 py-16 text-center">
        <p className="text-white/70">Villa details are not available at the moment.</p>
      </section>
    )
  }

  const heroImage = images[activeImageIndex] ?? images[0] ?? getDefaultVillaImages()[0]
  const thumbnailImages = images.filter((_, index) => index !== activeImageIndex).slice(0, 3)
  const { weekdayPrice, weekendPrice } = resolveVillaNightlyRates(room)
  const bookUrl = room.slug ? `/book/${room.slug}` : '/rooms'
  const detailsUrl = room.slug ? `/room/${room.slug}` : '/rooms'
  const amenities = room.amenities?.slice(0, 5) ?? []
  const guestCapacity = room.max_capacity || room.max_occupancy || 12

  const highlights = [
    { icon: HomeModernIcon, label: '4 BHK Villa', sub: 'Entire property' },
    { icon: UsersIcon, label: `Up to ${guestCapacity}`, sub: 'Guests' },
    { icon: MapPinIcon, label: 'Panchgani', sub: 'Hill station' },
  ]

  const staySteps = [
    { step: '01', title: 'Pick dates', desc: 'Weekday or Saturday rates' },
    { step: '02', title: 'Book online', desc: 'Instant confirmation' },
    { step: '03', title: 'Arrive & unwind', desc: formatCheckInFromLabel(checkTimes) },
  ]

  return (
    <section className="relative overflow-hidden bg-dark-blue-900">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-golden-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-dark-blue-500/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Visual column */}
          <motion.div {...fadeUp(0)} className="relative space-y-4 lg:col-span-6 xl:col-span-7">
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/40">
              <div className="aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[16/11]">
                <img
                  src={heroImage}
                  alt={room.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => {
                    const fallback = getDefaultVillaImages()
                    const next = images[activeImageIndex + 1] ?? fallback[0]
                    if (next && next !== heroImage) {
                      setActiveImageIndex((prev) => prev + 1)
                    }
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-900/90 via-dark-blue-900/20 to-transparent" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:text-sm">
                  <SparklesIcon className="h-4 w-4 text-golden-400" />
                  Private 4BHK
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:text-sm">
                  Valley views
                </span>
              </div>

              {thumbnailImages.length > 0 && (
                <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-6 sm:right-6">
                  {thumbnailImages.map((img) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setActiveImageIndex(images.indexOf(img))}
                      className="h-14 w-14 overflow-hidden rounded-xl border-2 border-white/30 shadow-lg transition-transform hover:scale-105 sm:h-16 sm:w-16"
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-golden-400">
                  Brick &amp; Beam
                </p>
                <h3 className="font-serif text-2xl font-bold text-white sm:text-3xl">{room.name}</h3>
              </div>
            </div>

            {/* Booking journey — directly below image */}
            <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {staySteps.map(({ step, title, desc }) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <span className="font-serif text-xl font-bold text-golden-500/80 sm:text-2xl">{step}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Booking panel */}
          <motion.div {...fadeUp(0.15)} className="lg:col-span-6 xl:col-span-5">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm sm:p-8 lg:p-9">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-golden-400">
                Reserve your escape
              </p>
              <h2 className="mb-4 font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
                Your villa,
                <span className="block bg-gradient-to-r from-golden-200 to-golden-500 bg-clip-text text-transparent">
                  on your dates
                </span>
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-white/70 sm:text-base">
                {room.description
                  ? room.description.length > 160
                    ? `${room.description.slice(0, 160)}…`
                    : room.description
                  : 'A spacious hill-station villa with modern comforts, perfect for families and groups seeking a private getaway.'}
              </p>

              <div className="mb-8 grid grid-cols-3 gap-3">
                {highlights.map(({ icon: Icon, label, sub }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-center"
                  >
                    <Icon className="mx-auto mb-2 h-5 w-5 text-golden-400" />
                    <p className="text-xs font-semibold text-white sm:text-sm">{label}</p>
                    <p className="mt-0.5 text-[10px] text-white/50 sm:text-xs">{sub}</p>
                  </div>
                ))}
              </div>

              <div className="mb-8 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-golden-500/20 bg-golden-500/10 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-golden-300 sm:text-xs">
                    Weekday
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-white sm:text-2xl">
                    {formatRupee(weekdayPrice)}
                  </p>
                  <p className="text-xs text-white/50">Mon – Fri &amp; Sun</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:text-xs">
                    Saturday
                  </p>
                  <p className="mt-1 font-serif text-xl font-bold text-white sm:text-2xl">
                    {formatRupee(weekendPrice)}
                  </p>
                  <p className="text-xs text-white/50">Weekend rate</p>
                </div>
              </div>

              {amenities.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {amenities.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to={bookUrl}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-golden-500 to-golden-600 px-6 py-4 text-base font-semibold text-dark-blue-900 shadow-lg shadow-golden-500/20 transition-all hover:from-golden-400 hover:to-golden-500 hover:shadow-golden-500/30"
                >
                  <CalendarDaysIcon className="h-5 w-5" />
                  Check Availability &amp; Book
                  <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to={detailsUrl}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-medium text-white/90 transition-colors hover:border-white/30 hover:bg-white/5"
                >
                  View villa gallery &amp; details
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-white/50">
                <span className="inline-flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-golden-400" />
                  Instant booking
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-golden-400" />
                  Check-in {checkTimes.check_in_time}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckBadgeIcon className="h-4 w-4 text-golden-400" />
                  Entire villa
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default VillaBookingShowcase
