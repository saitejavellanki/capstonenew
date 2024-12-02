import React, { useState, useEffect } from 'react';
import { 
  Container, 
  VStack, 
  Heading, 
  Box, 
  Text, 
  Button, 
  Divider,
  HStack,
  Image,
  useToast,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Stack,
  Flex,
  IconButton,
  useBreakpointValue
} from '@chakra-ui/react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [groupedItems, setGroupedItems] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedShop, setSelectedShop] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
 
  const toast = useToast();
  const firestore = getFirestore();
  const navigate = useNavigate();

  // PayU Configuration
  const PAYU_MERCHANT_KEY = 'gSR07M';
  // const PAYU_SALT_KEY = 'is0d9q0QV8sOTOpB8j3XGJU0XR7o5zrS';
  const PAYU_BASE_URL = 'https://secure.payu.in/_payment'; // Use test URL for sandbox

  const isMobile = useBreakpointValue({ base: true, md: false });
  const containerPadding = useBreakpointValue({ base: 4, md: 8 });
  const imageSize = useBreakpointValue({ base: "80px", md: "100px" });

  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
      
      const grouped = savedCart.reduce((acc, item) => {
        const shopId = item.shopId;
        if (!acc[shopId]) {
          acc[shopId] = {
            items: [],
            shopName: item.shopName,
            total: 0
          };
        }
        acc[shopId].items.push(item);
        acc[shopId].total += item.price * item.quantity;
        return acc;
      }, {});
      
      setGroupedItems(grouped);
    };

    loadCart();
  }, []);

  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    window.dispatchEvent(new Event('cartUpdate'));
    
    const grouped = updatedCart.reduce((acc, item) => {
      const shopId = item.shopId;
      if (!acc[shopId]) {
        acc[shopId] = {
          items: [],
          shopName: item.shopName,
          total: 0
        };
      }
      acc[shopId].items.push(item);
      acc[shopId].total += item.price * item.quantity;
      return acc;
    }, {});
    
    setGroupedItems(grouped);
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    setCartItems(updatedCart);

    window.dispatchEvent(new Event('cartUpdate'));
    
    const grouped = updatedCart.reduce((acc, item) => {
      const shopId = item.shopId;
      if (!acc[shopId]) {
        acc[shopId] = {
          items: [],
          shopName: item.shopName,
          total: 0
        };
      }
      acc[shopId].items.push(item);
      acc[shopId].total += item.price * item.quantity;
      return acc;
    }, {});
    
    setGroupedItems(grouped);
  };

  const handlePlaceOrder = async (shopId, shopData) => {
    setSelectedShop({ id: shopId, ...shopData });
    onOpen();
  };

  const generatePayUHash = (params) => {
    const PAYU_SALT_KEY = 'RZdd32itbMYSKM7Kwo4teRkhUKCsWbnj';
  
    // Ensure consistent order of parameters
    const hashString = `${params.key}|${params.txnid}|${params.amount}|${params.productinfo}|${params.firstname}|${params.email}|||||||||||${PAYU_SALT_KEY}`;
  
    // Use SHA-512 to generate the hash
    const hash = CryptoJS.SHA512(hashString).toString(CryptoJS.enc.Hex);
    
    return hash;
  };

  const initiatePayUPayment = async (shopData) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const txnid = `TXN_${Date.now()}`;
    
    // First, create the order in Firestore to get the order ID
    const orderData = {
      shopId: shopData.id,
      userId: user.uid,
      shopName: shopData.shopName,
      items: shopData.items,
      total: shopData.total,
      status: 'pending',
      paymentStatus: 'pending',
      customerEmail: user.email,
      createdAt: new Date(),
      txnid: txnid
    };
  
    try {
      // Create the order first to get the order ID
      const newDocRef = await addDoc(collection(firestore, 'orders'), orderData);
      const orderId = newDocRef.id;
  
      const paymentParams = {
        key: PAYU_MERCHANT_KEY,
        txnid: txnid,
        amount: shopData.total.toFixed(2),
        productinfo: `Order for ${shopData.shopName}`,
        firstname: user.displayName || 'Customer',
        email: user.email,
        phone: user.phoneNumber || '',
        surl: 'https://fostserver.onrender.com/payment-success', // Use order ID here
        furl: 'http://localhost:5001/payment-success',
      };
  
      // Generate hash
      paymentParams.hash = generatePayUHash(paymentParams);
  
      // Redirect to PayU payment page
      const form = document.createElement('form');
      form.method = 'post';
      form.action = 'https://secure.payu.in/_payment';
  
      // Add all payment parameters as hidden inputs
      Object.keys(paymentParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentParams[key];
        form.appendChild(input);
      });
  
      document.body.appendChild(form);
      form.submit();
  
      return orderId;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to place order. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    }
  };

  

  if (cartItems.length === 0) {
    return (
      <Container maxW="container.xl" py={containerPadding}>
        <Alert status="info">
          <AlertIcon />
          Your cart is empty. Start shopping to add items!
        </Alert>
      </Container>
    );
  }

  const CartItem = ({ item }) => (
    <Box width="100%">
      <Flex gap={4} width="100%">
        {/* Image stays on left */}
        <Image
          src={item.imageUrl}
          alt={item.name}
          boxSize={imageSize}
          objectFit="cover"
          borderRadius="md"
          flexShrink={0}
        />
        
        {/* Content wrapper */}
        <Flex 
          flex="1"
          justify="space-between"
          width="100%"
          align="center"
        >
          {/* Product details */}
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>{item.name}</Text>
            <Text color="gray.600" fontSize={{ base: "sm", md: "md" }}>
              RS {item.price.toFixed(2)} each
            </Text>
          </VStack>
  
          {/* Right side controls - quantity, price, delete */}
          <Flex 
            align="center" 
            gap={{ base: 2, md: 6 }}
            flexShrink={0}
          >
            {/* Quantity controls */}
            <HStack spacing={2}>
              <IconButton
                size="sm"
                icon={<Minus size={16} />}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                aria-label="Decrease quantity"
              />
              <Text width="40px" textAlign="center">{item.quantity}</Text>
              <IconButton
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                aria-label="Increase quantity"
              />
            </HStack>
            
            {/* Price */}
            <Text 
              fontWeight="bold" 
              fontSize={{ base: "sm", md: "md" }}
              minWidth={{ base: "60px", md: "80px" }}
              textAlign="right"
            >
              Rs {(item.price * item.quantity).toFixed(2)}
            </Text>
            
            {/* Delete button */}
            <IconButton
              variant="ghost"
              colorScheme="red"
              icon={<Trash2 size={20} />}
              onClick={() => removeFromCart(item.id)}
              aria-label="Remove item"
              flexShrink={0}
            />
          </Flex>
        </Flex>
      </Flex>
      <Divider mt={4} />
    </Box>
  );

  if (cartItems.length === 0) {
    return (
      <Container maxW="container.xl" py={containerPadding}>
        <Alert status="info">
          <AlertIcon />
          Your cart is empty. Start shopping to add items!
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={containerPadding}>
      <VStack spacing={6} align="stretch">
        <Heading size={{ base: "lg", md: "xl" }}>Shopping Cart</Heading>

        {Object.entries(groupedItems).map(([shopId, shopData]) => (
          <Box 
            key={shopId}
            borderWidth="1px"
            borderRadius="lg"
            p={{ base: 4, md: 6 }}
            bg="white"
            shadow="sm"
          >
            <Heading size={{ base: "md", md: "lg" }} mb={4}>
              {shopData.shopName}
            </Heading>
            
            <VStack spacing={4} align="stretch">
              {shopData.items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
              
              <Box pt={4}>
                <Flex 
                  direction={{ base: "column", md: "row" }}
                  justify="space-between"
                  align={{ base: "stretch", md: "center" }}
                  gap={4}
                >
                  <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
                    Total for {shopData.shopName}:
                    <Text as="span" color="green.600" ml={2}>
                      Rs {shopData.total.toFixed(2)}
                    </Text>
                  </Text>
                  
                  <Button
                    colorScheme="blue"
                    size={{ base: "md", md: "lg" }}
                    width={{ base: "full", md: "auto" }}
                    onClick={() => handlePlaceOrder(shopId, shopData)}
                  >
                    Place Order
                  </Button>
                </Flex>
              </Box>
            </VStack>
          </Box>
        ))}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay />
        <ModalContent margin={{ base: 0, md: "auto" }}>
          <ModalHeader>Confirm Order and Pay</ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <Text>Shop: {selectedShop?.shopName}</Text>
              <Text fontWeight="bold">
                Total Amount: Rs {selectedShop?.total.toFixed(2)}
              </Text>
              
              <Button 
                colorScheme="blue" 
                onClick={() => initiatePayUPayment(selectedShop)}
                width="full"
              >
                Proceed to PayU Payment
              </Button>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default Cart;