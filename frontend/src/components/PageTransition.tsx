import { Box } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { pageVariants } from '@/theme/motion'

const MotionBox = motion.create(Box)

/** Shared enter/exit transition keyed by pathname for all app shells. */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <MotionBox
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        w="full"
        h="full"
      >
        {children}
      </MotionBox>
    </AnimatePresence>
  )
}
