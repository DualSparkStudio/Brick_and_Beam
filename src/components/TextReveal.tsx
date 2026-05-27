import { useEffect, useRef } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface TextRevealProps {
  children: React.ReactNode
  variant?: 'fade' | 'slide' | 'mask' | 'split' | 'char'
  delay?: number
  duration?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'
}

export default function TextReveal({
  children,
  variant = 'fade',
  delay = 0,
  duration = 0.8,
  className = '',
  as = 'div',
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const controls = useAnimation()
  const textRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (isInView) {
      if (variant === 'split' || variant === 'char') {
        // Split text animation with GSAP
        if (textRef.current) {
          const text = textRef.current.textContent || ''
          textRef.current.innerHTML = text
            .split(' ')
            .map((word) => `<span class="inline-block">${word.split('').map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`).join('')}</span>`)
            .join(' ')

          const chars = textRef.current.querySelectorAll('span span')
          gsap.fromTo(
            chars,
            {
              opacity: 0,
              y: 50,
            },
            {
              opacity: 1,
              y: 0,
              duration: duration,
              stagger: variant === 'char' ? 0.02 : 0.05,
              delay: delay,
              ease: 'power3.out',
            }
          )
        }
      } else {
        controls.start('visible')
      }
    }
  }, [isInView, variant, delay, duration, controls])

  const variants = {
    fade: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    slide: {
      hidden: { opacity: 0, x: -50 },
      visible: { opacity: 1, x: 0 },
    },
    mask: {
      hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
      visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
    },
  }

  const Component = as

  if (variant === 'split' || variant === 'char') {
    return (
      <Component
        ref={(el) => {
          ref.current = el
          if (el) textRef.current = el
        }}
        className={className}
      >
        {children}
      </Component>
    )
  }

  return (
    <motion.div ref={ref} className="overflow-hidden">
      <motion.div
        variants={variants[variant]}
        initial="hidden"
        animate={controls}
        transition={{ duration, delay }}
        className={className}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
