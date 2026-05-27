import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FormFieldProps {
  label: string
  type?: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  error?: string
  required?: boolean
  placeholder?: string
  textarea?: boolean
  rows?: number
}

export default function FormField({
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  textarea = false,
  rows = 4,
}: FormFieldProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(!!value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setHasValue(!!value)
  }, [value])

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => {
    setIsFocused(false)
    setHasValue(!!value)
  }

  const baseClasses = `w-full bg-dark-blue-900/50 border ${
    error
      ? 'border-red-500'
      : isFocused
      ? 'border-golden-500'
      : 'border-golden-500/30'
  } rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-golden-500/50 transition-all duration-300`

  return (
    <div className="relative mb-6">
      <div className="relative">
        {textarea ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || label}
            required={required}
            rows={rows}
            className={baseClasses}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder || label}
            required={required}
            className={baseClasses}
          />
        )}

        {/* Floating Label */}
        <motion.label
          initial={false}
          animate={{
            y: isFocused || hasValue ? -32 : 0,
            x: isFocused || hasValue ? 0 : 0,
            scale: isFocused || hasValue ? 0.85 : 1,
          }}
          transition={{ duration: 0.2 }}
          className={`absolute left-4 pointer-events-none ${
            isFocused || hasValue
              ? 'text-golden-500 top-2'
              : 'text-white/60 top-3'
          } transition-colors duration-200`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </motion.label>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-400 text-sm mt-2"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
