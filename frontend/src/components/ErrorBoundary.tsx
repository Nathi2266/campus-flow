import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Text, VStack } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Uncaught UI error', error, info.componentStack)
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          role="alert"
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          px={6}
          py={12}
          bg="app-bg"
        >
          <VStack spacing={4} maxW="md" textAlign="center">
            <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="app-text">
              Something went wrong
            </Text>
            <Text color="app-muted" lineHeight="tall">
              An unexpected error occurred. Reload the page to continue.
            </Text>
            <Button onClick={this.handleReload} autoFocus>
              Reload
            </Button>
          </VStack>
        </Box>
      )
    }

    return this.props.children
  }
}
