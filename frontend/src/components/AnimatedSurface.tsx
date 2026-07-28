import { Box } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { Surface } from '@/components/ui'
import { authPanelVariants } from '@/theme/motion'
import type { BoxProps } from '@chakra-ui/react'

const MotionBox = motion.create(Box)

export function AnimatedSurface({
  children,
  ...rest
}: BoxProps & { children: ReactNode }) {
  return (
    <MotionBox variants={authPanelVariants} initial="initial" animate="animate" style={{ width: '100%', maxWidth: '32rem' }}>
      <Surface {...rest}>{children}</Surface>
    </MotionBox>
  )
}
