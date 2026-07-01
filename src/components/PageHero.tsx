import type { ReactNode } from 'react'
import { PAGE_HERO_IMAGES } from '../config/galleryImages'

interface PageHeroProps {
  title: string
  subtitle?: string
  image?: string
  children?: ReactNode
  size?: 'default' | 'tall'
}

export default function PageHero({
  title,
  subtitle,
  image = PAGE_HERO_IMAGES.default,
  children,
  size = 'default',
}: PageHeroProps) {
  const heightClass =
    size === 'tall'
      ? 'min-h-[280px] sm:min-h-[320px] lg:min-h-[400px]'
      : 'h-64 sm:h-80 lg:h-96'

  return (
    <section className={`relative overflow-hidden ${heightClass}`}>
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-dark-blue-900/90 via-dark-blue-900/65 to-golden-900/45" />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex h-full items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-4xl text-center text-white">
          {children}
          <h1 className="mb-3 font-serif text-3xl font-bold sm:mb-4 sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mx-auto max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
