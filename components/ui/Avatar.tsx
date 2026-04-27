import Image from 'next/image'
import { getAvatarUrl } from '../../lib/utils'
import { cn } from '../../lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = { xs: 24, sm: 32, md: 40, lg: 56, xl: 80 }
const sizeClass = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
}

export default function Avatar({ src, alt = 'User', size = 'md', className }: AvatarProps) {
  const avatarUrl = getAvatarUrl(src)
  const px = sizeMap[size]

  if (avatarUrl === '/default-avatar.svg') {
    const initials = alt.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-amber-600/30 font-semibold text-amber-400 border border-amber-600/40 flex-shrink-0',
          sizeClass[size],
          className
        )}
      >
        {initials || '?'}
      </div>
    )
  }

  return (
    <div
      className={cn('relative rounded-full overflow-hidden flex-shrink-0 border border-slate-700', sizeClass[size], className)}
    >
      <Image src={avatarUrl} alt={alt} width={px} height={px} className="object-cover w-full h-full" />
    </div>
  )
}
