import {
  ArrowRightIcon,
  ChevronDownIcon,
  MapPinIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HERO_IMAGES } from '../config/galleryImages'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen overflow-hidden bg-dark-blue-900">
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

      <div className="relative z-10 mx-auto flex min-h-[92vh] sm:min-h-screen max-w-7xl flex-col px-4 pb-8 pt-28 sm:px-6 sm:pb-12 sm:pt-32 lg:px-8">
        <div className="grid flex-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Copy */}
          <div className="lg:col-span-7 xl:col-span-6">
            <motion.div
              {...fadeUp(0.1)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur-md"
            >
              <MapPinIcon className="h-4 w-4 text-golden-400" />
              <span>Bhilar, Mahabaleshwar</span>
              <span className="h-1 w-1 rounded-full bg-golden-400/80" />
              <span className="text-golden-300">Hill Station Retreat</span>
            </motion.div>

            <motion.p
              {...fadeUp(0.2)}
              className="mb-4 text-xs font-medium uppercase tracking-[0.35em] text-golden-400 sm:text-sm"
            >
              Welcome to paradise
            </motion.p>

            <motion.h1
              {...fadeUp(0.3)}
              className="font-serif text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl"
            >
              Escape to
              <span className="mt-2 block bg-gradient-to-r from-golden-200 via-golden-400 to-golden-600 bg-clip-text text-transparent">
                timeless luxury
              </span>
            </motion.h1>

            <motion.div
              {...fadeUp(0.35)}
              className="my-6 h-px w-16 bg-gradient-to-r from-golden-400 to-transparent sm:my-8 sm:w-24"
            />

            <motion.p
              {...fadeUp(0.45)}
              className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg"
            >
              Nestled in the Western Ghats, our 4BHK villa blends serene nature with
              refined comfort — private spaces, warm hospitality, and views that
              stay with you long after checkout.
            </motion.p>

            <motion.div
              {...fadeUp(0.55)}
              className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
            >
              <Link
                to="/rooms"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-golden-500 to-golden-600 px-8 py-4 text-sm font-semibold text-dark-blue-900 shadow-lg shadow-golden-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-golden-400 hover:to-golden-500 hover:shadow-xl hover:shadow-golden-500/30 sm:text-base"
              >
                Book Your Stay
                <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-8 py-4 text-sm font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-white/40 hover:bg-white/15 sm:text-base"
              >
                View Gallery
              </Link>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              {...fadeUp(0.65)}
              className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4"
            >
              {[
                { icon: SparklesIcon, label: 'Premium Villas', value: 'Curated Stay' },
                { icon: MapPinIcon, label: 'Location', value: 'Mahabaleshwar' },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-golden-500/30 hover:bg-white/10"
                >
                  <Icon className="mb-2 h-5 w-5 text-golden-400" />
                  <p className="text-xs uppercase tracking-wider text-white/50">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-white sm:text-base">{value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bento image collage — desktop */}
          <div className="hidden lg:col-span-5 lg:col-start-8 xl:col-span-6 xl:col-start-7 lg:block">
            <div className="relative h-[520px] xl:h-[580px]">
              <motion.div
                initial={{ opacity: 0, x: 40, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-0 top-0 h-[68%] w-[58%] overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-black/40"
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
                className="absolute bottom-8 left-0 h-[48%] w-[52%] overflow-hidden rounded-3xl border-2 border-white/30 shadow-2xl shadow-black/40"
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
                className="absolute bottom-0 right-[8%] h-[38%] w-[42%] overflow-hidden rounded-2xl border border-golden-500/40 shadow-xl shadow-golden-500/10"
              >
                <img
                  src={HERO_IMAGES.night}
                  alt="Resort at night"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-golden-500/10 to-transparent" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Mobile image strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex gap-3 overflow-x-auto pb-2 scrollbar-hide lg:hidden"
          data-lenis-prevent
        >
          {[HERO_IMAGES.main, HERO_IMAGES.pool, HERO_IMAGES.night].map((src, i) => (
            <div
              key={src}
              className={`relative flex-shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-lg ${
                i === 1 ? 'h-28 w-36' : 'h-24 w-28'
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-auto flex justify-center pt-6 sm:pt-8"
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
