import {
  ArrowRightIcon,
  ChevronDownIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HERO_IMAGES } from '../config/galleryImages'
import { PUBLIC_BOOK_CTA_HREF } from '../config/brand'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

const HeroImageCollage = ({ className = '' }: { className?: string }) => (
  <div className={`relative w-full ${className}`}>
    <motion.div
      initial={{ opacity: 0, x: 40, y: 20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 h-[68%] w-[58%] overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-black/40 sm:rounded-3xl"
    >
      <img
        src={HERO_IMAGES.main}
        alt="Resort front view"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-900/40 to-transparent" />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: -30, y: 30 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-6 left-0 h-[48%] w-[52%] overflow-hidden rounded-2xl border-2 border-white/30 shadow-2xl shadow-black/40 sm:bottom-8 sm:rounded-3xl"
    >
      <img
        src={HERO_IMAGES.pool}
        alt="Resort pool area"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="absolute bottom-0 right-[8%] h-[38%] w-[42%] overflow-hidden rounded-xl border border-golden-500/40 shadow-xl shadow-golden-500/10 sm:rounded-2xl"
    >
      <img
        src={HERO_IMAGES.night}
        alt="Resort at night"
        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-golden-500/10 to-transparent" />
    </motion.div>
  </div>
)

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-dark-blue-900 lg:min-h-screen">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <motion.img
          src={HERO_IMAGES.main}
          alt="Resort exterior at dusk"
          className="h-full w-full object-cover object-center"
          initial={{ scale: 1.12 }}
          animate={{ scale: 1 }}
          transition={{ duration: 14, ease: [0.22, 1, 0.36, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-dark-blue-900/95 via-dark-blue-900/70 to-dark-blue-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-blue-900/90 via-transparent to-dark-blue-900/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(212,175,55,0.15),transparent_50%)]" />
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute -right-24 top-1/4 h-72 w-72 rounded-full bg-golden-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-1/4 h-56 w-56 rounded-full bg-dark-blue-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-3 pb-7 pt-[5.25rem] sm:px-6 sm:pb-8 sm:pt-28 lg:flex lg:min-h-screen lg:flex-col lg:px-8 lg:pb-12 lg:pt-32">
        <div className="grid grid-cols-12 items-center gap-2.5 sm:gap-5 md:gap-6 lg:flex-1 lg:gap-8">
          {/* Copy */}
          <div className="col-span-7 min-w-0 xl:col-span-6">
            <motion.div
              {...fadeUp(0.1)}
              className="mb-2.5 inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-white/15 bg-white/10 px-2 py-1 text-[9px] text-white/90 backdrop-blur-md sm:mb-5 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <MapPinIcon className="h-3 w-3 shrink-0 text-golden-400 sm:h-4 sm:w-4" />
              <span>Bhilar, Mahabaleshwar</span>
              <span className="hidden h-1 w-1 rounded-full bg-golden-400/80 sm:inline-block" />
              <span className="hidden text-golden-300 sm:inline">Hill Station Retreat</span>
            </motion.div>

            <motion.p
              {...fadeUp(0.2)}
              className="mb-1.5 text-[9px] font-medium uppercase tracking-[0.2em] text-golden-400 sm:mb-3 sm:text-xs sm:tracking-[0.35em] md:text-sm"
            >
              Welcome to paradise
            </motion.p>

            <motion.h1
              {...fadeUp(0.3)}
              className="font-serif text-[1.55rem] font-bold leading-[1.06] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Escape to
              <span className="mt-0.5 block bg-gradient-to-r from-golden-200 via-golden-400 to-golden-600 bg-clip-text text-transparent sm:mt-2">
                timeless luxury
              </span>
            </motion.h1>

            <motion.div
              {...fadeUp(0.35)}
              className="my-2.5 h-px w-9 bg-gradient-to-r from-golden-400 to-transparent sm:my-5 sm:w-16 md:my-8 md:w-24"
            />

            <motion.p
              {...fadeUp(0.45)}
              className="hidden max-w-xl text-sm leading-relaxed text-white/75 sm:block md:text-base lg:text-lg"
            >
              Nestled in the Western Ghats, our 4BHK villa blends serene nature with
              refined comfort — private spaces, warm hospitality, and views that
              stay with you long after checkout.
            </motion.p>

            <motion.div
              {...fadeUp(0.55)}
              className="mt-3.5 flex flex-nowrap items-center gap-1.5 sm:mt-6 sm:gap-3 md:mt-8 lg:mt-10"
            >
              <Link
                to={PUBLIC_BOOK_CTA_HREF}
                className="group flex min-w-0 flex-1 items-center justify-center gap-0.5 rounded-full bg-gradient-to-r from-golden-500 to-golden-600 px-2 py-1.5 text-[10px] font-semibold leading-none text-dark-blue-900 shadow-md shadow-golden-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-golden-400 hover:to-golden-500 sm:flex-none sm:gap-2 sm:px-6 sm:py-3.5 sm:text-sm sm:leading-tight sm:shadow-lg md:px-8 md:py-4 md:text-base"
              >
                <span className="truncate sm:hidden">Book Now</span>
                <span className="hidden sm:inline">Book Your Stay</span>
                <ArrowRightIcon className="hidden h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1 sm:block md:h-5 md:w-5" />
              </Link>
              <Link
                to="/gallery"
                className="flex min-w-0 flex-1 items-center justify-center rounded-full border border-white/25 bg-white/10 px-2 py-1.5 text-[10px] font-semibold leading-none text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15 sm:flex-none sm:px-6 sm:py-3.5 sm:text-sm sm:leading-tight md:px-8 md:py-4 md:text-base"
              >
                <span className="truncate sm:hidden">Gallery</span>
                <span className="hidden sm:inline">View Gallery</span>
              </Link>
            </motion.div>

            {/* Trust stats — desktop/tablet only to keep mobile compact */}
            <motion.div
              {...fadeUp(0.65)}
              className="mt-8 hidden grid-cols-2 gap-3 sm:mt-10 sm:grid md:gap-4 lg:mt-12"
            >
              {[
                { icon: SparklesIcon, label: 'Premium Villas', value: 'Curated Stay' },
                { icon: MapPinIcon, label: 'Location', value: 'Mahabaleshwar' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-colors hover:border-golden-500/30 hover:bg-white/10 md:p-4"
                >
                  <Icon className="mb-2 h-5 w-5 text-golden-400" />
                  <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white md:text-base">{value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bento collage — slight bump on mobile only */}
          <div className="col-span-5 min-w-0 xl:col-span-6 xl:col-start-7">
            <HeroImageCollage className="h-[13.5rem] sm:h-[300px] md:h-[400px] lg:h-[520px] xl:h-[580px]" />
          </div>
        </div>

        {/* Scroll hint — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-4 hidden justify-center lg:mt-auto lg:flex lg:pt-8"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-1 text-white/40"
          >
            <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
            <ChevronDownIcon className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
