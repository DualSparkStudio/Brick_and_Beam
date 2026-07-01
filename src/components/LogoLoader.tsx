import { LOGO_IMAGE } from '../config/galleryImages'

interface LogoLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
}

const LogoLoader: React.FC<LogoLoaderProps> = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        {/* Spinning border */}
        <div className={`${sizeClasses[size]} rounded-full border-4 border-gray-200 border-t-golden-500 animate-spin`}></div>
        
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={LOGO_IMAGE}
            alt="Brick and Beam"
            className={`${sizeClasses[size]} rounded-full object-contain p-2 bg-white`}
          />
        </div>
      </div>
      
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  )
}

export default LogoLoader
