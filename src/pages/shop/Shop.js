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
  chakra,
  Badge,
  HStack,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody
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
import { ViewColumnsIcon } from '@heroicons/react/24/outline';
import { app } from '../../Components/firebase/Firebase';

import ShopItemCard from '../../Components/shopitemcard/ShopItemCard';
// const FOOD_CATEGORIES = [
//   "Beverages",
//   "Appetizers",
//   "Main Course",
//   "Desserts",
//   "Snacks",
//   "Breakfast",
//   "Lunch",
//   "Dinner",
//   "Vegan",
//   "Vegetarian",
//   "Salads",
//   "Soups",
//   "Fast Food",
//   "Street Food",
//   "Healthy Options",
//   "Milkshake Bites",
//   "Slushy Splash",
//   "Fruit-A-List",
//   "Ice Colas",
//   "Mojitos",
//   "Ba..Ba..Banana",
//   "We are Oreons",
//   "Chocolate Factory",
//   "Tipsy Thickshakes",
//   "Brownie Bros",
//   "Nutella Ninjas",
//   "Protein Shakes"
// ];

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
  const [hoveredItem, setHoveredItem] = useState(null);
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
    // Only allow clicking on active items
    if (item.isActive !== false) {
      setSelectedItem(item);
      onOpen();
    }
  };

  const addToCart = (item) => {

    if (item.isActive === false) {
      toast({
        title: 'Item Unavailable',
        description: 'This item is currently not available',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

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
      
      window.dispatchEvent(new Event('cartUpdate'));

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
  const CategoryNavigation = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      zIndex={20}
    >
      <Popover 
        placement="top-end"
        isLazy
        lazyBehavior="unmount"
      >
        {({ isOpen }) => (
          <>
            <PopoverTrigger>
              <Button
                colorScheme="blue"
                borderRadius="full"
                size="lg"
                boxShadow="xl"
                p={0}
                width="56px"
                height="56px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ViewColumnsIcon width={24} height={24} />
              </Button>
            </PopoverTrigger>
            {isMobile ? (
              <Modal 
                isOpen={isOpen} 
                onClose={() => {}} 
                size="xs"
                motionPreset="slideInBottom"
              >
                <ModalOverlay />
                <ModalContent 
                  position="absolute" 
                  bottom={0} 
                  mb={0} 
                  borderBottomRadius={0}
                >
                  <ModalHeader>Categories</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody p={2}>
                    <VStack 
                      spacing={2} 
                      align="stretch" 
                      maxHeight="300px" 
                      overflowY="auto"
                    >
                      {Object.keys(categorizedItems)
                        .filter(category => categorizedItems[category].length > 0 && category !== 'Uncategorized')
                        .map(category => (
                          <Button
                            key={category}
                            variant={activeCategory === category ? "solid" : "ghost"}
                            colorScheme={activeCategory === category ? "blue" : "gray"}
                            justifyContent="space-between"
                            onClick={() => {
                              scrollToCategory(category);
                              // Close the modal/popover
                              document.querySelector('[aria-label="Close"]')?.click();
                            }}
                            size="md"
                            borderRadius="md"
                          >
                            <Text>{category}</Text>
                            <Badge 
                              ml={2} 
                              colorScheme="gray" 
                              variant="solid" 
                              borderRadius="full"
                              fontSize="0.7em"
                            >
                              {categorizedItems[category].length}
                            </Badge>
                          </Button>
                        ))}
                    </VStack>
                  </ModalBody>
                </ModalContent>
              </Modal>
            ) : (
              <PopoverContent 
                width="auto" 
                maxWidth="300px"
                boxShadow="xl"
                borderRadius="xl"
                bg="white"
              >
                <PopoverBody>
                  <VStack 
                    spacing={2} 
                    align="stretch" 
                    maxHeight="300px" 
                    overflowY="auto"
                    p={2}
                  >
                    {Object.keys(categorizedItems)
                      .filter(category => categorizedItems[category].length > 0 && category !== 'Uncategorized')
                      .map(category => (
                        <Button
                          key={category}
                          variant={activeCategory === category ? "solid" : "ghost"}
                          colorScheme={activeCategory === category ? "blue" : "gray"}
                          justifyContent="space-between"
                          onClick={() => {
                            scrollToCategory(category);
                            // Close the popover
                            document.querySelector('[aria-label="Close"]')?.click();
                          }}
                          size="md"
                          borderRadius="md"
                        >
                          <Text>{category}</Text>
                          <Badge 
                            ml={2} 
                            colorScheme="gray" 
                            variant="solid" 
                            borderRadius="full"
                            fontSize="0.7em"
                          >
                            {categorizedItems[category].length}
                          </Badge>
                        </Button>
                      ))}
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            )}
          </>
        )}
      </Popover>
    </Box>
  );
};
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
          {/* Shop Header */}
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
                    <Grid 
                      templateColumns={{
                        base: "1fr",
                        md: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)"
                      }}
                      gap={6}
                    >
                      {categorizedItems[category].map((item) => (
                        <ShopItemCard
                          key={item.id}
                          item={item}
                          onAddToCart={addToCart}
                          onItemClick={handleItemClick}
                        />
                      ))}
                    </Grid>
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
          <ModalHeader>
  {selectedItem?.name}
  <Badge 
    ml={2} 
    colorScheme={selectedItem?.dietType === 'veg' ? 'green' : 'red'}
  >
    {selectedItem?.dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
  </Badge>
  {selectedItem?.isActive === false && (
    <Badge 
      ml={2} 
      colorScheme="red"
    >
      Unavailable
    </Badge>
  )}
</ModalHeader>
            <ModalHeader>
              {selectedItem?.name}
              {selectedItem?.isActive === false && (
                <Badge 
                  ml={2} 
                  colorScheme="red"
                >
                  Unavailable
                </Badge>
              )}
            </ModalHeader>
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
                    filter={selectedItem.isActive === false ? 'grayscale(100%)' : 'none'}
                  />
                  <Text>{selectedItem.description}</Text>
                  <Flex justify="space-between" align="center">
                    <Text 
                      color={selectedItem.isActive === false ? "gray.400" : "green.600"}
                      fontSize="2xl" 
                      fontWeight="bold"
                      textDecoration={selectedItem.isActive === false ? "line-through" : "none"}
                    >
                      ${selectedItem.price.toFixed(2)}
                    </Text>
                    <Button 
                      colorScheme="blue" 
                      onClick={() => {
                        addToCart(selectedItem);
                        onClose();
                      }}
                      isDisabled={selectedItem.isActive === false}
                    >
                      {selectedItem.isActive === false ? 'Unavailable' : 'Add to Cart'}
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