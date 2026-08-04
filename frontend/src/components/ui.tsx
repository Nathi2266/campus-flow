import { Box, type BoxProps } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { pageVariants, staggerContainer, staggerItem } from '@/theme/motion'

const MotionBox = motion.create(Box)

export function AnimatedPage({ children }: { children: ReactNode }) {
  return (
    <MotionBox variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </MotionBox>
  )
}

export function Stagger({ children }: { children: ReactNode }) {
  return (
    <MotionBox variants={staggerContainer} initial="initial" animate="animate">
      {children}
    </MotionBox>
  )
}

export function StaggerItem({ children }: { children: ReactNode }) {
  return <MotionBox variants={staggerItem}>{children}</MotionBox>
}

export function Surface({
  children,
  interactive,
  ...rest
}: BoxProps & { children?: ReactNode; interactive?: boolean }) {
  return (
    <Box
      bg="app-surface"
      borderWidth="1px"
      borderColor="app-border"
      borderRadius="lg"
      shadow="soft"
      transition="box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease, background 0.2s ease"
      {...(interactive
        ? {
            _hover: {
              shadow: 'lift',
              transform: 'translateY(-3px)',
              borderColor: 'brand.200',
            },
            _active: {
              transform: 'translateY(-1px)',
            },
          }
        : {})}
      {...rest}
    >
      {children}
    </Box>
  )
}
