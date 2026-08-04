import { Box, Image, type ImageProps } from '@chakra-ui/react'

/** White mark on transparent (`public/campus_logo.png`). */
export const CAMPUS_LOGO_SRC = '/campus_logo.png'
/** White mark on brand-dark tile for browser tabs. */
export const CAMPUS_FAVICON_SRC = '/favicon.png'

type BrandLogoProps = Omit<ImageProps, 'src'> & {
  /**
   * `dark` — white mark on dark/brand surfaces (default).
   * `light` — white mark on a brand badge so it stays visible on light shells
   * (AppLayout ADMIN/LECTURER/STUDENT, sticky marketing header).
   */
  surface?: 'dark' | 'light'
}

/** CampusFlow white brand mark (shared by all roles). */
export function BrandLogo({
  boxSize = '40px',
  alt = 'CampusFlow',
  surface = 'dark',
  ...rest
}: BrandLogoProps) {
  const mark = (
    <Image
      src={CAMPUS_LOGO_SRC}
      alt={alt}
      boxSize={surface === 'light' ? '85%' : boxSize}
      objectFit="contain"
      flexShrink={0}
      draggable={false}
      {...rest}
    />
  )

  if (surface !== 'light') {
    return mark
  }

  return (
    <Box
      boxSize={boxSize}
      flexShrink={0}
      borderRadius="md"
      bg="brand.700"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      aria-hidden={alt === '' ? true : undefined}
    >
      {mark}
    </Box>
  )
}
