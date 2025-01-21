import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Text, VStack, Button } from '@chakra-ui/react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    
    // Optional: Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      return (
        <Box 
          p={6} 
          bg="red.50" 
          borderRadius="md" 
          boxShadow="md"
          textAlign="center"
        >
          <VStack spacing={4}>
            <Text fontSize="xl" color="red.600" fontWeight="bold">
              Something went wrong
            </Text>
            <Text color="red.500">
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            <Button 
              colorScheme="red" 
              variant="outline"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
