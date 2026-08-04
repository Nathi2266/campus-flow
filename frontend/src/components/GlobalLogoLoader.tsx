import { Box, Portal, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotatingLogo } from '@/components/RotatingLogo'
import { selectIsBusy, useLoadingStore } from '@/features/loading/loadingStore'

const MotionBox = motion.create(Box)

/** Centered full-screen logo loader driven by the global loading store. */
export function GlobalLogoLoaderHost() {
  const busy = useLoadingStore(selectIsBusy)
  const scrim = useColorModeValue('blackAlpha.400', 'blackAlpha.600')
  const panel = useColorModeValue('whiteAlpha.900', 'gray.800')

  return (
    <Portal>
      <AnimatePresence>
        {busy ? (
          <MotionBox
            key="global-logo-loader"
            position="fixed"
            inset={0}
            zIndex="toast"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={scrim}
            backdropFilter="blur(2px)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-busy="true"
            aria-live="polite"
            aria-label="Loading"
          >
            <VStack
              spacing={4}
              px={8}
              py={7}
              borderRadius="xl"
              bg={panel}
              shadow="lift"
              borderWidth="1px"
              borderColor="app-border"
            >
              <RotatingLogo boxSize="80px" />
              <Text fontSize="sm" fontWeight="600" color="app-muted" letterSpacing="0.04em">
                Loading
              </Text>
            </VStack>
          </MotionBox>
        ) : null}
      </AnimatePresence>
    </Portal>
  )
}
