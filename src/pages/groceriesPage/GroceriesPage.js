import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Text,
  Image,
  Button,
  VStack,
  HStack,
  Container,
  Badge,
  useToast,
  Skeleton,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue
} from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../Components/firebase/Firebase';
import { useNavigate } from 'react-router-dom';

const GroceryPage = () => {
  const [groceries, setGroceries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  // Color modes
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');

  const fetchGroceries = async () => {
    try {
      const groceriesCollection = collection(firestore, 'itemsGroceries');
      console.log('Attempting to fetch groceries...');
      
      const groceriesSnapshot = await getDocs(groceriesCollection);
      console.log('Groceries snapshot:', groceriesSnapshot.size, 'documents found');
      
      const groceriesList = groceriesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Document data:', data);
        return {
          id: doc.id,
          ...data
        };
      });
      
      console.log('Processed groceries list:', groceriesList);
      setGroceries(groceriesList);
      setLoading(false);
    } catch (error) {
      console.error('Detailed error fetching groceries:', error);
      toast({
        title: 'Error',
        description: `Failed to load groceries: ${error.message}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroceries();
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  const getItemQuantity = (itemId) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const updateCart = (newCart) => {
    localStorage.setItem('cart', JSON.stringify(newCart));
    setCartItems(newCart);
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const addToCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      existingCart[existingItemIndex].quantity += 1;
    } else {
      existingCart.push({
        ...item,
        quantity: 1,
        shopId: item.shopId || 'grocery-store',
        shopName: item.shopName || 'Grocery Store',
        category: item.category || 'grocery',
        dietType: item.dietType || 'all'
      });
    }

    updateCart(existingCart);

    toast({
      title: 'Added to cart',
      description: `${item.name} added to cart`,
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const removeFromCart = (item) => {
    const existingCart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex >= 0) {
      if (existingCart[existingItemIndex].quantity > 1) {
        existingCart[existingItemIndex].quantity -= 1;
      } else {
        existingCart.splice(existingItemIndex, 1);
      }
      updateCart(existingCart);
    }
  };

  const CartButton = ({ item }) => {
    const quantity = getItemQuantity(item.id);
    
    if (quantity === 0) {
      return (
        <Button
          colorScheme="orange"
          size="sm"
          width="full"
          height="28px"
          fontSize="sm"
          onClick={() => addToCart(item)}
        >
          ADD
        </Button>
      );
    }

    return (
      <HStack spacing={1} width="full" justify="space-between" p="1" border="1px" borderColor="orange.500" borderRadius="md">
        <Button
          size="xs"
          colorScheme="orange"
          variant="ghost"
          onClick={() => removeFromCart(item)}
        >
          -
        </Button>
        <Text fontWeight="medium" fontSize="sm">{quantity}</Text>
        <Button
          size="xs"
          colorScheme="orange"
          variant="ghost"
          onClick={() => addToCart(item)}
        >
          +
        </Button>
      </HStack>
    );
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <Box bg={cardBg} py={2} px={4} position="sticky" top={0} zIndex={10} boxShadow="sm">
        <Container maxW="container.xl">
          <HStack spacing={4} justify="space-between">
            <Text fontSize="xl" fontWeight="bold" color="orange.500">Groceries</Text>
            <InputGroup maxW="md">
              <InputLeftElement>
                <Icon as={FiSearch} color="gray.500" />
              </InputLeftElement>
              <Input 
                placeholder="Search for items..." 
                bg="gray.100"
                _placeholder={{ color: 'gray.500' }}
              />
            </InputGroup>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={4}>
        <Grid
          templateColumns={{
            base: "repeat(2, 1fr)",
            sm: "repeat(3, 1fr)",
            md: "repeat(4, 1fr)",
            lg: "repeat(5, 1fr)",
            xl: "repeat(6, 1fr)"
          }}
          gap={3}
        >
          {loading
            ? Array(12).fill(0).map((_, i) => (
                <VStack
                  key={i}
                  p={2}
                  bg={cardBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                  spacing={1}
                >
                  <Skeleton height="100px" width="full" />
                  <Skeleton height="16px" width="full" />
                  <Skeleton height="24px" width="full" />
                </VStack>
              ))
            : groceries.map((item) => (
                <VStack
                  key={item.id}
                  p={2}
                  bg={cardBg}
                  borderRadius="md"
                  border="1px"
                  borderColor={borderColor}
                  spacing={1}
                  align="stretch"
                  _hover={{ boxShadow: 'sm' }}
                  transition="all 0.2s"
                  height="220px"
                >
                  <Box position="relative" height="100px">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      height="100px"
                      width="full"
                      objectFit="contain"
                      fallbackSrc="https://via.placeholder.com/100"
                    />
                    {item.discount > 0 && (
                      <Badge
                        position="absolute"
                        top={1}
                        left={1}
                        colorScheme="orange"
                        fontSize="xs"
                        px={2}
                      >
                        {item.discount}% OFF
                      </Badge>
                    )}
                  </Box>
                  <Flex justify="space-between" align="start" gap={1}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor} noOfLines={2} flex="1">
                      {item.name}
                    </Text>
                    <VStack align="end" spacing={0} flexShrink={0}>
                      <Text fontWeight="bold" fontSize="sm">
                        ₹{item.price}
                      </Text>
                      {item.discount > 0 && (
                        <Text 
                          fontSize="xs" 
                          color={subTextColor} 
                          textDecoration="line-through"
                        >
                          ₹{Math.round(item.price * (100 / (100 - item.discount)))}
                        </Text>
                      )}
                    </VStack>
                  </Flex>
                  <Text fontSize="xs" color={subTextColor} mt={-1}>
                    {item.weight}
                  </Text>
                  <Box mt="auto">
                    <CartButton item={item} />
                  </Box>
                </VStack>
              ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default GroceryPage;