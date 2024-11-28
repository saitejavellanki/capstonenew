import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Heading, 
  Input, 
  Button, 
  Text, 
  Link, 
  useToast, 
  Select,
  FormControl,
  FormErrorMessage
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
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
        // Check admin existence
        const adminSnapshot = await getDocs(
          query(collection(firestore, 'users'), where('role', '==', 'admin'))
        );
        
        // Get all vendors and their shops
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

        // Load available shops
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
      // Validation checks
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

      // Create user
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Store user data
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

      // Navigate based on role
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
    <Flex justify="center" align="center" h="100vh" bg="gray.100">
      <Box w="400px" p={8} borderWidth={1} borderRadius="lg" boxShadow="lg" bg="white">
        <Heading mb={4} fontWeight="bold" fontSize="2xl">Register</Heading>
        <form onSubmit={handleRegister}>
          <FormControl mb={4}>
            <Input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg="gray.100"
              borderRadius="md"
              height="50px"
            />
          </FormControl>

          <FormControl mb={4} isInvalid={!!passwordError}>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              bg="gray.100"
              borderRadius="md"
              height="50px"
            />
          </FormControl>

          <FormControl mb={4} isInvalid={!!passwordError}>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              bg="gray.100"
              borderRadius="md"
              height="50px"
            />
            {passwordError && (
              <FormErrorMessage>{passwordError}</FormErrorMessage>
            )}
          </FormControl>
          
          <Select 
            mb={4} 
            placeholder="Select Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="customer">Customer</option>
            {!restrictions.adminExists && <option value="admin">Admin</option>}
            {availableShops.length > 0 && <option value="vendor">Vendor</option>}
          </Select>

          {role === 'vendor' && (
            <Select 
              mb={4}
              placeholder="Select Your Shop"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              required
            >
              {availableShops.map(shop => (
                <option key={shop.id} value={shop.id}>
                  {shop.name}
                </option>
              ))}
            </Select>
          )}

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
            Register
          </Button>
        </form>

        <Text mt={4} textAlign="center">
          Already Have an account? <Link href="/login" color="blue.500" fontWeight="bold">Login</Link>
        </Text>
      </Box>
    </Flex>
  );
};

export default Register;