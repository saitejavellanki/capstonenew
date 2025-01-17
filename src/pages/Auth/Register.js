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
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { MdEmail, MdLock, MdPerson, MdStore } from 'react-icons/md';
import { 
  doc, 
  setDoc, 
  collection, 
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { auth, firestore } from '../../Components/firebase/Firebase';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [shopId, setShopId] = useState('');
  const [availableShops, setAvailableShops] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
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
        console.error('Error loading registration data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load registration data',
          status: 'error',
          duration: 3000,
        });
      }
    };

    loadRegistrationData();
  }, [toast]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setIsLoading(true);

    try {
      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }

      if (role === 'admin' && restrictions.adminExists) {
        throw new Error('An admin already exists');
      }

      if (role === 'vendor') {
        if (!shopId) {
          throw new Error('Please select a shop');
        }
        if (restrictions.takenShops.has(shopId)) {
          throw new Error('This shop already has a vendor');
        }
      }

      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        role,
        shopId: role === 'vendor' ? shopId : null,
        createdAt: new Date()
      });

      toast({
        title: 'Registration Successful',
        status: 'success',
        duration: 3000,
      });

      navigate(role === 'admin' ? '/admin/shops' : 
              role === 'vendor' ? '/vendor/items' : '/');

    } catch (error) {
      toast({
        title: 'Registration Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                  placeholder="Select Your Shop"
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                  required
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                  icon={<MdStore />}
                >
                  {availableShops.map(shop => (
                    <option key={shop.id} value={shop.id}>
                      {shop.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button
              w="full"
              size="lg"
              colorScheme="orange"
              type="submit"
              isLoading={isLoading}
              _hover={{ bg: "orange.600" }}
            >
              Create Account
            </Button>
          </VStack>

          <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
            By joining, you agree to our{" "}
            <Link color="orange.500">Terms of Service</Link> and{" "}
            <Link color="orange.500">Privacy Policy</Link>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Register;