import React, { useState } from 'react';
import { 
  Box, 
  Flex, 
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
      // Validate email
      if (!email) {
        setResetError('Please enter your email address');
        return;
      }

      // Send password reset email
      await sendPasswordResetEmail(auth, email);

      // Set success message
      setResetSuccess('Password reset link sent to your email. Check your inbox.');
      
      // Show toast notification
      toast({
        title: 'Password Reset',
        description: 'Password reset link sent successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error('Password reset error:', error);
      
      // Specific error handling
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
      h="100vh" 
      bg="gray.100"
    >
      <Box 
        w="400px" 
        p={8} 
        borderWidth={1} 
        borderRadius="lg" 
        boxShadow="lg" 
        bg="white"
      >
        <Heading mb={4} fontWeight="bold" fontSize="2xl">
          Reset Password
        </Heading>
        <Text mb={6} color="gray.500">
          Enter your email to reset your password
        </Text>

        {resetError && (
          <Alert status="error" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{resetError}</AlertDescription>
          </Alert>
        )}

        {resetSuccess && (
          <Alert status="success" mb={4} borderRadius="md">
            <AlertIcon />
            <AlertDescription>{resetSuccess}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleResetPassword}>
          <FormControl mb={4}>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="gray.100"
              borderRadius="md"
              height="50px"
              _placeholder={{ color: 'gray.500' }}
            />
          </FormControl>

          <Button
            colorScheme="blue"
            w="full"
            type="submit"
            height="50px"
            borderRadius="md"
            isLoading={isLoading}
            fontWeight="bold"
            fontSize="lg"
          >
            Send Reset Link
          </Button>
        </form>

        <Text mt={4} textAlign="center">
          Remember your password? 
          <Link 
            onClick={handleNavigateToLogin} 
            color="blue.500" 
            fontWeight="bold" 
            ml={2}
            cursor="pointer"
          >
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default Reset;