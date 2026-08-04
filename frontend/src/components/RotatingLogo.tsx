import { Image, useColorModeValue, usePrefersReducedMotion } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionImage = motion.create(Image)

const LOGO_INK = '/campus_logo_ink.png'
const LOGO_WHITE = '/campus_logo_white.png'

/** Theme-aware mark: light → ink, dark → white. Rotates once, pauses 2s, repeats. */
export function RotatingLogo({ boxSize = '72px' }: { boxSize?: string | number }) {
  const src = useColorModeValue(LOGO_INK, LOGO_WHITE)
  const reduceMotion = usePrefersReducedMotion()

  if (reduceMotion) {
    return (
      <Image
        src={src}
        alt=""
        boxSize={boxSize}
        objectFit="contain"
        draggable={false}
        aria-hidden
      />
    )
  }

  return (
    <MotionImage
      src={src}
      alt=""
      boxSize={boxSize}
      objectFit="contain"
      draggable={false}
      aria-hidden
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.85,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatDelay: 2,
      }}
      style={{ transformOrigin: 'center center' }}
    />
  )
}
