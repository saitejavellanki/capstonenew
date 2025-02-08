import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Stack,
  VStack,
  HStack,
  Heading, 
  Input, 
  Button, 
  Text, 
  Link, 
  useToast, 
  Select,
  FormControl,
  FormErrorMessage,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { MdEmail, MdLock, MdPerson, MdStore } from 'react-icons/md';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  getDoc,
  query,
  where,
  deleteDoc
} from 'firebase/firestore';
import { auth, firestore } from '../../Components/firebase/Firebase';
import { createLogger } from '../utils/ErrorLoggers';

const Register = () => {

  const logger = createLogger('RegisterComponent');
  // Basic form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [shopId, setShopId] = useState('');
  const [availableShops, setAvailableShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [verificationStatus, setVerificationStatus] = useState({
    isVerifying: false,
    message: ''
  });

  // Verification state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationTimer, setVerificationTimer] = useState(0);
  const [tempUser, setTempUser] = useState(null);
  const [verificationCheckInterval, setVerificationCheckInterval] = useState(null);

  // Restrictions state
  const [restrictions, setRestrictions] = useState({
    adminExists: false,
    takenShops: new Set()
  });

  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadRegistrationData = async () => {
      try {
        const adminSnapshot = await getDocs(
          query(collection(firestore, 'users'), where('role', '==', 'admin'))
        );
        
        const vendorSnapshot = await getDocs(
          query(collection(firestore, 'users'), where('role', '==', 'vendor'))
        );
        
        const takenShops = new Set();
        vendorSnapshot.forEach(doc => {
          const { shopId } = doc.data();
          if (shopId) takenShops.add(shopId);
        });

        setRestrictions({
          adminExists: !adminSnapshot.empty,
          takenShops
        });

        const shopsSnapshot = await getDocs(collection(firestore, 'shops'));
        const shops = shopsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(shop => !takenShops.has(shop.id));
        
        setAvailableShops(shops);
      } catch (error) {
        logger.error(error, {
          action: 'loadRegistrationData',
          component: 'Register',
          userData: { role }
        });
        
        toast({
          title: 'Error Loading Data',
          description: 'Failed to load registration data. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadRegistrationData();
  }, [toast, role]);

  // Cleanup verification check interval
  // Clean up intervals and state on unmount
useEffect(() => {
  return () => {
    if (verificationCheckInterval) {
      clearInterval(verificationCheckInterval);
    }
    setVerificationTimer(0);
    setVerificationStatus({
      isVerifying: false,
      message: ''
    });
  };
}, []);

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user?.emailVerified) {
      // Check if this user has a document in Firestore
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      
      // Only complete registration if the user document doesn't exist
      if (!userDoc.exists()) {
        await completeRegistration(user);
      }
    }
  });

  return () => unsubscribe();
}, []);

// Reset verification state when modal closes
useEffect(() => {
  if (!isVerificationModalOpen) {
    if (verificationCheckInterval) {
      clearInterval(verificationCheckInterval);
    }
    setVerificationTimer(0);
    setVerificationStatus({
      isVerifying: false,
      message: ''
    });
  }
}, [isVerificationModalOpen]);



const startVerificationCheck = (user) => {
  try {
    setVerificationTimer(300); // 5 minutes in seconds
    setVerificationStatus({
      isVerifying: true,
      message: 'Email verification in progress...'
    });
    
    // Clear any existing interval first
    if (verificationCheckInterval) {
      clearInterval(verificationCheckInterval);
    }
    
    // Check less frequently (every 2 seconds instead of every second)
    const interval = setInterval(async () => {
      setVerificationTimer(prevTimer => {
        if (prevTimer <= 0) {
          clearInterval(interval);
          handleVerificationTimeout(user);
          return 0;
        }
        
        // Only check verification status every 2 seconds
        if (prevTimer % 2 === 0) {
          checkVerificationStatus(user, interval);
        }
        return prevTimer - 1;
      });
    }, 1000);
    
    setVerificationCheckInterval(interval);
    
    logger.info(new Error('Verification check started'), {
      action: 'startVerificationCheck',
      userId: user.uid,
      email: user.email
    });
  } catch (error) {
    logger.error(error, {
      action: 'startVerificationCheck',
      userId: user?.uid,
      email: user?.email
    });
  }
};
  
  // Separate function to handle verification timeout
  const handleVerificationTimeout = async (user) => {
    try {
      if (user) {
        // Delete Firestore document
        try {
          await deleteDoc(doc(firestore, 'users', user.uid));
        } catch (docError) {
          logger.error(docError, {
            action: 'handleVerificationTimeout',
            operation: 'deleteDoc',
            userId: user.uid
          });
        }
  
        // Delete auth user
        try {
          await user.delete();
        } catch (userError) {
          logger.error(userError, {
            action: 'handleVerificationTimeout',
            operation: 'deleteUser',
            userId: user.uid
          });
          await signOut(auth);
        }
      }
  
      setIsVerificationModalOpen(false);
      setVerificationStatus({
        isVerifying: false,
        message: 'Verification timeout. Please try registering again.'
      });
      
      toast({
        title: 'Verification Timeout',
        description: 'Please try registering again',
        status: 'error',
        duration: 5000,
      });
    } catch (error) {
      logger.error(error, {
        action: 'handleVerificationTimeout',
        userId: user?.uid
      });
    }
  };
  
  // Separate function to check verification status
  const checkVerificationStatus = async (user, interval) => {
    try {
      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        setVerificationStatus({
          isVerifying: false,
          message: 'Email verified successfully!'
        });
        
        // Show immediate success feedback
        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
  
        // Complete registration process
        await completeRegistration(user);
        
        logger.info(new Error('Email verification successful'), {
          action: 'checkVerificationStatus',
          userId: user.uid,
          email: user.email
        });
      }
    } catch (error) {
      logger.error(error, {
        action: 'checkVerificationStatus',
        userId: user?.uid,
        email: user?.email
      });
  
      toast({
        title: 'Verification Error',
        description: 'Failed to verify email. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        const error = new Error('Google email not verified');
        logger.warn(error, {
          action: 'googleSignIn',
          email: user.email,
          userId: user.uid
        });
        
        toast({
          title: 'Email Not Verified',
          description: 'Please verify your Google email before continuing',
          status: 'warning',
          duration: 5000,
        });
        await signOut(auth);
        return;
      }

      await completeRegistration(user);
    } catch (error) {
      logger.error(error, {
        action: 'googleSignIn',
        component: 'Register'
      });
      
      const errorMessage = error.code === 'auth/popup-closed-by-user'
        ? 'Sign-in window was closed. Please try again.'
        : error.message;
      
      toast({
        title: 'Google Sign In Failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseVerificationModal = () => {
    try {
      // Log modal closure
      logger.info(new Error('Verification modal closed by user'), {
        action: 'handleCloseVerificationModal',
        userId: tempUser?.uid,
        email: tempUser?.email,
        timeRemaining: verificationTimer
      });
  
      // Clear the check interval but don't reset verification timer
      if (verificationCheckInterval) {
        clearInterval(verificationCheckInterval);
        setVerificationCheckInterval(null);
      }
  
      // Close modal but maintain verification status
      setIsVerificationModalOpen(false);
  
      // Show info toast
      toast({
        title: 'Verification Pending',
        description: 'You can still complete verification through the email link',
        status: 'info',
        duration: 5000,
      });
    } catch (error) {
      logger.error(error, {
        action: 'handleCloseVerificationModal',
        userId: tempUser?.uid
      });
    }
  };
  const completeRegistration = async (user) => {
    try {
      // Check if user document already exists to prevent duplicate creation
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (userDoc.exists()) {
        // If user exists, redirect immediately
        handleRedirect(role);
        return;
      }
  
      // Create user document in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        role,
        shopId: role === 'vendor' ? shopId : null,
        createdAt: new Date()
      });
  
      // Close verification modal immediately if it's open
      setIsVerificationModalOpen(false);
  
      // Show success message and redirect simultaneously
      toast({
        title: 'Registration Successful!',
        description: 'Welcome to our platform!',
        status: 'success',
        duration: 3000, // Reduced from 5000
        isClosable: true,
      });
  
      // Redirect immediately without delay
      handleRedirect(role);
  
      logger.info(new Error('Registration completed successfully'), {
        action: 'completeRegistration',
        userId: user.uid,
        role,
        shopId: role === 'vendor' ? shopId : null
      });
  
    } catch (error) {
      logger.error(error, {
        action: 'completeRegistration',
        userId: user.uid,
        role
      });
  
      toast({
        title: 'Registration Error',
        description: 'Failed to complete registration. Please try again.',
        status: 'error',
        duration: 3000, // Reduced from 5000
        isClosable: true,
      });
    }
  };

  const handleRedirect = (userRole) => {
    switch (userRole) {
      case 'admin':
        navigate('/admin/shops');
        break;
      case 'vendor':
        navigate('/vendor/items');
        break;
      default:
        navigate('/');
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setIsLoading(true);

    try {
      // Validation checks
      if (password !== confirmPassword) {
        const error = new Error('Passwords do not match');
        logger.warn(error, {
          action: 'register',
          validationType: 'passwordMatch'
        });
        setPasswordError('Passwords do not match');
        return;
      }

      if (role === 'admin' && restrictions.adminExists) {
        const error = new Error('Admin already exists');
        logger.warn(error, {
          action: 'register',
          validationType: 'adminRestriction'
        });
        throw error;
      }

      if (role === 'vendor') {
        if (!shopId) {
          const error = new Error('Shop selection required');
          logger.warn(error, {
            action: 'register',
            validationType: 'shopRequired'
          });
          throw error;
        }
        if (restrictions.takenShops.has(shopId)) {
          const error = new Error('Shop already has a vendor');
          logger.warn(error, {
            action: 'register',
            validationType: 'shopTaken',
            shopId
          });
          throw error;
        }
      }

      // Check for Google email
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      const isGoogleEmail = signInMethods.includes(GoogleAuthProvider.PROVIDER_ID);

      if (isGoogleEmail) {
        const error = new Error('Email is associated with Google account');
        logger.warn(error, {
          action: 'register',
          validationType: 'googleEmail',
          email
        });
        
        toast({
          title: 'Google Account Detected',
          description: 'Please use the Google Sign In button instead',
          status: 'info',
          duration: 5000,
        });
        return;
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      logger.info(new Error('User created successfully'), {
        action: 'register',
        userId: user.uid,
        role
      });
      
      setTempUser(user);
      
      await sendEmailVerification(user);
      setIsVerificationModalOpen(true);
      startVerificationCheck(user);

    } catch (error) {
      logger.error(error, {
        action: 'register',
        email,
        role,
        shopId: role === 'vendor' ? shopId : null
      });

      const errorMessages = {
        'auth/email-already-in-use': 'This email is already registered',
        'auth/invalid-email': 'Please enter a valid email address',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/network-request-failed': 'Network error. Please check your connection',
      };

      toast({
        title: 'Registration Failed',
        description: errorMessages[error.code] || error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!tempUser) return;
    
    try {
      await sendEmailVerification(tempUser);
      toast({
        title: 'Verification Email Sent',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error resending verification:', error);
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <>
      <Flex minH="100vh" direction={{ base: "column", md: "row" }}>
        {/* Left Side - Hero Section */}
        <Box
          display={{ base: "none", md: "flex" }}
          flex="1"
          bg="orange.500"
        >
          <VStack
            w="full"
            h="full"
            justify="center"
            p={10}
            spacing={6}
            color="white"
          >
            <Heading size="2xl" fontWeight="bold" textAlign="center">
              Start Your Journey
            </Heading>
            <Text fontSize="xl" textAlign="center" maxW="500px">
              Join our marketplace and discover endless opportunities for growth and success
            </Text>
            
            <Stack spacing={6} mt={4}>
              <HStack spacing={4} justify="center">
                <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                  <Text fontWeight="bold">Fast</Text>
                  <Text fontSize="sm">Registration</Text>
                </Box>
                <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                  <Text fontWeight="bold">Secure</Text>
                  <Text fontSize="sm">Platform</Text>
                </Box>
                <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                  <Text fontWeight="bold">24/7</Text>
                  <Text fontSize="sm">Support</Text>
                </Box>
              </HStack>
            </Stack>
          </VStack>
        </Box>

        {/* Right Side - Registration Form */}
        <Flex
          flex="1"
          bg="white"
          justify="center"
          align="center"
          p={{ base: 4, md: 6, lg: 8 }}
        >
           {verificationStatus.isVerifying && (
          <Alert
            status="info"
            position="fixed"
            bottom={4}
            right={4}
            width="auto"
            zIndex={1000}
          >
            <AlertIcon />
            <Text>{verificationStatus.message}</Text>
            <Text ml={2}>
              Time remaining: {Math.floor(verificationTimer / 60)}:
              {String(verificationTimer % 60).padStart(2, '0')}
            </Text>
          </Alert>
        )}
          <VStack
            w="full"
            maxW="440px"
            spacing={4}
            as="form"
            onSubmit={handleRegister}
          >
            <VStack spacing={1} align="flex-start" w="full">
              <Heading fontSize="3xl" color="gray.800">
                Create Account
              </Heading>
              <Text color="gray.600">
                Already have an account?{" "}
                <Link
                  color="orange.500"
                  fontWeight="semibold"
                  _hover={{ color: "orange.600" }}
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Link>
              </Text>
            </VStack>

            {/* Google Sign In Button */}
            <Button
              w="full"
              size="lg"
              variant="outline"
              // leftIcon={<Icon as={MdGoogle} />}
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
            >
              Continue with Google
            </Button>

            <HStack w="full">
           
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                or continue with email
              </Text>
              
            </HStack>

            <VStack spacing={3} w="full">
              <FormControl>
                <Input
                  size="lg"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                  leftElement={
                    <Icon as={MdEmail} color="gray.400" ml={3} />
                  }
                />
              </FormControl>

              <FormControl isInvalid={!!passwordError}>
                <Input
                  size="lg"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                  leftElement={
                    <Icon as={MdLock} color="gray.400" ml={3} />
                  }
                />
              </FormControl>

              <FormControl isInvalid={!!passwordError}>
                <Input
                  size="lg"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                  leftElement={
                    <Icon as={MdLock} color="gray.400" ml={3} />
                  }
                />
                {passwordError && (
                  <FormErrorMessage>{passwordError}</FormErrorMessage>
                )}
              </FormControl>

              <FormControl>
                <Select
                  size="lg"
                  placeholder="Select Role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                  icon={<MdPerson />}
                >
                  <option value="customer">Customer</option>
                  {!restrictions.adminExists && <option value="admin">Admin</option>}
                  {availableShops.length > 0 && <option value="vendor">Vendor</option>}
                </Select>
              </FormControl>

            
              {role === 'vendor' && (
                <FormControl>
                  <Select
                    size="lg"
                    placeholder="Select Shop"
                    value={shopId}
                    onChange={(e) => setShopId(e.target.value)}
                    required={role === 'vendor'}
                    borderColor="gray.200"
                    _hover={{ borderColor: "orange.400" }}
                    _focus={{
                      borderColor: "orange.500",
                      boxShadow: "0 0 0 1px orange.500",
                    }}
                    icon={<MdStore />}
                  >
                    {availableShops.map((shop) => (
                      <option key={shop.id} value={shop.id}>
                        {shop.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Button
                type="submit"
                size="lg"
                w="full"
                colorScheme="orange"
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </VStack>
          </VStack>
        </Flex>
      </Flex>

      {/* Email Verification Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={handleCloseVerificationModal}
        closeOnOverlayClick={true}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex justify="space-between" align="center">
              <Text>Verify Your Email</Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCloseVerificationModal}
              >
                Close
              </Button>
            </Flex>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Alert status="info">
                <AlertIcon />
                <Text>
                  A verification email has been sent to {email}. Please check your
                  inbox and click the verification link.
                </Text>
              </Alert>
              
              <Text>
                Time remaining: {Math.floor(verificationTimer / 60)}:
                {String(verificationTimer % 60).padStart(2, '0')}
              </Text>

              <Button
                w="full"
                onClick={resendVerificationEmail}
                isDisabled={verificationTimer > 270} // Allow resend after 30 seconds
              >
                Resend Verification Email
              </Button>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Text fontSize="sm" color="gray.500">
              You can close this window and continue verifying your email
            </Text>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Register;