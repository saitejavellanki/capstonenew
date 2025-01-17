import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
  Stack,
  Heading, 
  Input, 
  Button, 
  Text, 
  Link, 
  useToast, 
  FormControl, 
  Alert,
  AlertIcon,
  AlertDescription
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../Components/firebase/Firebase';

const Reset = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const toast = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResetError('');
    setResetSuccess('');

    try {
      if (!email) {
        setResetError('Please enter your email address');
        return;
      }
      await sendPasswordResetEmail(auth, email);
      setResetSuccess('Password reset link sent to your email. Check your inbox.');
      
      toast({
        title: 'Password Reset',
        description: 'Password reset link sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Password reset error:', error);
      
      switch(error.code) {
        case 'auth/invalid-email':
          setResetError('Invalid email address');
          break;
        case 'auth/user-not-found':
          setResetError('No account found with this email');
          break;
        case 'auth/too-many-requests':
          setResetError('Too many reset attempts. Please try again later.');
          break;
        default:
          setResetError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    navigate('/login');
  }

  return (
    <Flex 
      justify="center" 
      align="center" 
      minH="100vh" 
      bg="gray.50"
      py={12}
      px={4}
    >
      <Stack spacing={8} maxW="md" w="full">
        {/* Top Card */}
        <Box
          position="relative"
          bg="orange.500"
          color="white"
          p={8}
          borderRadius="xl"
          boxShadow="xl"
          transform="translateY(24px)"
          zIndex={1}
        >
          <Heading fontSize="3xl" fontWeight="extrabold" mb={2}>
            Reset Password
          </Heading>
          <Text fontSize="lg" opacity={0.9}>
            Get back to your account in no time
          </Text>
        </Box>

        {/* Main Card */}
        <Box
          bg="white"
          p={8}
          borderRadius="xl"
          boxShadow="2xl"
          position="relative"
          zIndex={2}
        >
          {resetError && (
            <Alert status="error" mb={6} borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{resetError}</AlertDescription>
            </Alert>
          )}

          {resetSuccess && (
            <Alert status="success" mb={6} borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{resetSuccess}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleResetPassword}>
            <Stack spacing={6}>
              <FormControl>
                <Input
                  placeholder="Enter your email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  size="lg"
                  bg="gray.50"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{
                    borderColor: 'orange.300'
                  }}
                  _focus={{
                    borderColor: 'orange.500',
                    boxShadow: '0 0 0 1px var(--chakra-colors-orange-500)'
                  }}
                />
              </FormControl>

              <Button
                type="submit"
                size="lg"
                bg="orange.500"
                color="white"
                _hover={{
                  bg: 'orange.600'
                }}
                _active={{
                  bg: 'orange.700'
                }}
                isLoading={isLoading}
                loadingText="Sending..."
                fontSize="md"
                fontWeight="bold"
                boxShadow="md"
              >
                Send Reset Link
              </Button>
            </Stack>
          </form>

          <Flex justify="center" mt={8}>
            <Text color="gray.600">
              Remember your password?{' '}
              <Link 
                onClick={handleNavigateToLogin} 
                color="orange.500" 
                fontWeight="semibold"
                _hover={{
                  color: 'orange.600',
                  textDecoration: 'underline'
                }}
              >
                Back to Login
              </Link>
            </Text>
          </Flex>
        </Box>

        {/* Bottom Card */}
        <Box
          bg="gray.100"
          p={6}
          borderRadius="xl"
          boxShadow="lg"
          transform="translateY(-24px)"
          textAlign="center"
        >
          <Text color="gray.600" fontSize="sm">
            Need help? Contact our support team
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
};

export default Reset;