import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface PremiumButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'ghost' | 'glass' | 'minimal' | 'gradient'
  className?: string
  onClick?: () => void
  href?: string
  magnetic?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export default function PremiumButton({
  children,
  variant = 'primary',
  className = '',
  onClick,
  href,
  magnetic = true,
  type = 'button',
}: PremiumButtonProps) {
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!magnetic || !buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    setPosition({ x: x * 0.3, y: y * 0.3 })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  const baseClasses = 'relative overflow-hidden font-medium transition-all duration-300'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white hover:shadow-2xl hover:shadow-golden-500/50',
    ghost: 'border-2 border-golden-500 text-golden hover:bg-golden-500 hover:text-dark-blue-800',
    glass: 'backdrop-blur-md bg-white/10 border border-white/20 text-white hover:bg-white/20',
    minimal: 'text-golden hover:text-golden-300 underline-offset-4 hover:underline',
    gradient: 'bg-gradient-to-r from-golden-500 to-golden-600 text-dark-blue-800 hover:from-golden-400 hover:to-golden-500',
  }

  const buttonContent = (
    <motion.span
      className="relative z-10 flex items-center justify-center"
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.span>
  )

  const commonProps = {
    ref: buttonRef as any,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: `${baseClasses} ${variantClasses[variant]} ${className}`,
  }

  if (href) {
    return (
      <motion.a
        {...commonProps}
        href={href}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {buttonContent}
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ x: '-100%' }}
          whileHover={{ x: 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.a>
    )
  }

  return (
    <motion.button
      {...commonProps}
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {buttonContent}
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ x: '-100%' }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}
