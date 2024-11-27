import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  Container,
  Grid,
  Image, 
  Text, 
  VStack, 
  Heading, 
  Spinner, 
  Alert, 
  AlertIcon,
  useToast,
  Button,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  useBreakpointValue,
  chakra
} from '@chakra-ui/react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  getDoc,
  doc 
} from 'firebase/firestore';
import { app } from '../../Components/firebase/Firebase';

const FOOD_CATEGORIES = [
  "Beverages",
  "Appetizers",
  "Main Course",
  "Desserts",
  "Snacks",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Vegan",
  "Vegetarian",
  "Salads",
  "Soups",
  "Fast Food",
  "Street Food",
  "Healthy Options"
];

const Shop = () => {
  const [items, setItems] = useState([]);
  const [categorizedItems, setCategorizedItems] = useState({});
  const [shopDetails, setShopDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const { shopId } = useParams();
  const firestore = getFirestore(app);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Refs for category sections
  const categoryRefs = useRef({});

  // Responsive menu visibility
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setLoading(true);
        
        // Fetch shop details (existing logic)
        const shopRef = doc(firestore, 'shops', shopId);
        const shopSnap = await getDoc(shopRef);
        
        if (!shopSnap.exists()) {
          throw new Error('Shop not found');
        }
        
        const shopData = {
          id: shopSnap.id,
          ...shopSnap.data()
        };
        setShopDetails(shopData);
    
        // Fetch items (existing logic)
        const itemsRef = collection(firestore, 'items');
        
        const queryStrategies = [
          query(itemsRef, where('vendorId', '==', shopData.vendorId)),
          ...(shopData.vendorId ? [
            query(itemsRef, where('shopId', '==', shopData.id)),
            query(itemsRef, where('vendorId', 'in', [shopData.vendorId, shopId, shopData.id]))
          ] : [])
        ];
    
        const snapshots = await Promise.all(queryStrategies.map(q => getDocs(q)));
        const itemsList = snapshots.flatMap(snapshot => 
          snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        );
    
        // Remove duplicate items
        const uniqueItems = Array.from(
          new Map(itemsList.map(item => [item.id, item])).values()
        );
        
        setItems(uniqueItems);

        // Categorize items
        const categorized = uniqueItems.reduce((acc, item) => {
          const category = item.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        }, {});

        setCategorizedItems(categorized);
        
        // Set first non-empty category as active
        const firstNonEmptyCategory = Object.keys(categorized).find(
          category => categorized[category].length > 0
        );
        setActiveCategory(firstNonEmptyCategory);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching shop data:', error);
        setError(error.message);
        setLoading(false);
        toast({
          title: 'Error',
          description: error.message || 'Could not fetch shop details or items',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    if (shopId) {
      fetchShopData();
    }
  }, [shopId, firestore, toast]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    onOpen();
  };

  const addToCart = (item) => {
    try {
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const itemIndex = existingCart.findIndex(cartItem => cartItem.id === item.id);
      
      if (itemIndex > -1) {
        existingCart[itemIndex].quantity = (existingCart[itemIndex].quantity || 1) + 1;
      } else {
        existingCart.push({
          ...item,
          quantity: 1,
          shopId: shopId,
          shopName: shopDetails?.name
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(existingCart));
      
      toast({
        title: 'Added to Cart',
        description: `${item.name} has been added to your cart`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Cart Error',
        description: 'Could not add item to cart',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const scrollToCategory = (category) => {
    setActiveCategory(category);
    const categoryElement = categoryRefs.current[category];
    if (categoryElement) {
      categoryElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Category Navigation Menu
  const CategoryNavigation = () => (
    <Box 
      position="fixed" 
      bottom={4} 
      left={0} 
      right={0} 
      zIndex={10} 
      px={4}
    >
      <Flex 
        bg="whiteAlpha.800" 
        backdropFilter="blur(10px)" 
        borderRadius="full" 
        boxShadow="0 4px 6px rgba(0,0,0,0.1)" 
        overflowX="auto" 
        p={2} 
        gap={2}
        maxW="600px"
        mx="auto"
        border="1px solid"
        borderColor="gray.100"
      >
        {Object.keys(categorizedItems).map(category => (
          category !== 'Uncategorized' && (
            <Button
              key={category}
              size="sm"
              variant={activeCategory === category ? "solid" : "ghost"}
              colorScheme={activeCategory === category ? "blue" : "gray"}
              borderRadius="full"
              onClick={() => scrollToCategory(category)}
              px={3}
              transition="all 0.2s"
              _hover={{
                transform: activeCategory === category ? 'none' : 'scale(1.05)',
                bg: activeCategory === category ? undefined : 'gray.50'
              }}
            >
              {category}
            </Button>
          )
        ))}
      </Flex>
    </Box>
  );

  return (
    <Container maxW="container.xl" py={8} position="relative" pb={20}>
      <VStack spacing={8} align="stretch">
        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" />
          </Flex>
        ) : error ? (
          <Alert status="error" variant="left-accent">
            <AlertIcon />
            <Text>{error}</Text>
          </Alert>
        ) : (
          <>
            {/* Shop Header - Existing code */}
            {shopDetails && (
              <Box 
                position="relative" 
                height="300px" 
                mb={6} 
                borderRadius="xl" 
                overflow="hidden"
              >
                <Image 
                  src={shopDetails.imageUrl} 
                  alt={shopDetails.name}
                  w="100%"
                  h="100%"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  bottom={0}
                  left={0}
                  right={0}
                  bg="blackAlpha.700"
                  p={6}
                >
                  <Heading color="white" size="xl">
                    {shopDetails.name}
                  </Heading>
                  {shopDetails.description && (
                    <Text 
                      color="whiteAlpha.900" 
                      mt={2} 
                      fontSize="lg"
                    >
                      {shopDetails.description}
                    </Text>
                  )}
                </Box>
              </Box>
            )}

            {/* Categorized Items Section */}
            <Box>
              {items.length === 0 ? (
                <Alert status="info" variant="left-accent">
                  <AlertIcon />
                  <Text>No items available in this shop at the moment.</Text>
                </Alert>
              ) : (
                Object.keys(categorizedItems)
                  .filter(category => categorizedItems[category].length > 0 && category !== 'Uncategorized')
                  .map(category => (
                    <Box 
                      key={category} 
                      mb={8}
                      ref={el => categoryRefs.current[category] = el}
                    >
                      <Heading size="lg" mb={6}>{category}</Heading>
                      <VStack spacing={4} align="stretch">
                        {categorizedItems[category].map((item) => (
                          <Box
                            key={item.id}
                            borderWidth="1px"
                            borderRadius="lg"
                            overflow="hidden"
                            boxShadow="sm"
                            transition="all 0.2s"
                            _hover={{
                              transform: 'translateY(-2px)',
                              boxShadow: 'md',
                            }}
                            bg="white"
                          >
                            <Flex direction="row">
                              <Box 
                                width="120px"
                                height="120px"
                                flexShrink={0}
                                borderRadius="md"
                                overflow="hidden"
                              >
                                <Image
                                  src={item.imageUrl}
                                  alt={item.name}
                                  width="100%"
                                  height="100%"
                                  objectFit="cover"
                                  cursor="pointer"
                                  onClick={() => handleItemClick(item)}
                                />
                              </Box>

                              <Flex 
                                flex="1" 
                                ml={4}
                                direction="column"
                                justify="space-between"
                              >
                                <Box>
                                  <Heading size="sm" mb={1}>
                                    {item.name}
                                  </Heading>
                                  <Text 
                                    color="gray.600" 
                                    noOfLines={2}
                                    mb={2}
                                    fontSize="sm"
                                  >
                                    {item.description}
                                  </Text>
                                </Box>

                                <Flex 
                                  justify="space-between" 
                                  align="center"
                                  mt="auto"
                                >
                                  <Text
                                    color="green.600"
                                    fontSize="2xl"
                                    fontWeight="bold"
                                  >
                                    Rs.{item.price.toFixed(2)}
                                  </Text>
                                  <Button
                                    colorScheme="blue"
                                    onClick={() => addToCart(item)}
                                    size="sm"
                                    width="auto"
                                  >
                                    Add to Cart
                                  </Button>
                                </Flex>
                              </Flex>
                            </Flex>
                          </Box>
                        ))}
                      </VStack>
                    </Box>
                  ))
              )}
            </Box>

            {/* Category Navigation */}
            <CategoryNavigation />

            {/* Existing Modal Code */}
            <Modal isOpen={isOpen} onClose={onClose} size="xl">
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>{selectedItem?.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  {selectedItem && (
                    <VStack spacing={4} align="stretch">
                      <Image 
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        maxH="400px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <Text>{selectedItem.description}</Text>
                      <Flex justify="space-between" align="center">
                        <Text 
                          color="green.600" 
                          fontSize="2xl" 
                          fontWeight="bold"
                        >
                          ${selectedItem.price.toFixed(2)}
                        </Text>
                        <Button 
                          colorScheme="blue" 
                          onClick={() => {
                            addToCart(selectedItem);
                            onClose();
                          }}
                        >
                          Add to Cart
                        </Button>
                      </Flex>
                    </VStack>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
      </VStack>
    </Container>
  );
};

export default Shop;