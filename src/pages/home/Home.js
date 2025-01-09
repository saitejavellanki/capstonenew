import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Image,
  VStack,
  Icon,
  Container,
  SimpleGrid,
  useColorModeValue,
  chakra,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Heading,
  Badge,
  Divider,
  HStack,
  Tag,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { FaUtensils, FaGift, FaShoppingBag, FaEye, FaStar, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import TutorialOverlay from "../utils/TutorialOverlay"
import Slider from 'react-slick';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot ,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { app } from '../../Components/firebase/Firebase';
import Recommendations from '../../Components/recommendations/Recommendations';
import BannerCarousel from '../../Components/banner/Banner';
import PremiumRecommendations from '../../Components/recommendations/PremiumRecommendations';



// Motion components
const MotionBox = chakra(motion.div);
const MotionFlex = chakra(motion.div);

// Constants
const FOOD_CATEGORIES = [
  { icon: FaUtensils, title: 'Food Courts', description: 'Explore our delicious menu' },
  // { icon: FaGift, title: 'Special Offers', description: 'Check out today\'s deals' }
];

const CAROUSEL_SETTINGS = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 3000,
  cssEase: "linear",
  arrows: false,
  pauseOnHover: true
};

// Enhanced Food Category Card
const FoodCategory = ({ icon, title, description, onClick }) => (
  <MotionFlex
    direction="column"
    align="center"
    justify="center"
    p={{ base: 4, md: 6 }}
    borderRadius="2xl"
    bg="white"
    boxShadow="lg"
    cursor="pointer"
    onClick={onClick}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    transition="all 0.3s ease"
    _hover={{
      boxShadow: '2xl',
      bg: 'green.50'
    }}
    h="full"
  >
    <Icon 
      as={icon} 
      boxSize={{ base: 8, md: 12 }} 
      color="green.500"
      mb={3}
    />
    <Text 
      fontWeight="bold" 
      fontSize={{ base: 'md', md: 'xl' }}
      color="gray.800"
      textAlign="center"
      mb={2}
    >
      {title}
    </Text>
    <Text
      fontSize={{ base: 'sm', md: 'md' }}
      color="gray.600"
      textAlign="center"
    >
      {description}
    </Text>
  </MotionFlex>
);

const PopularShopCard = ({ shop, onClick }) => (
  <MotionBox
    position="relative"
    borderRadius="2xl"
    overflow="hidden"
    boxShadow="md"
    cursor={shop.isOpen ? "pointer" : "not-allowed"}
    onClick={shop.isOpen ? onClick : undefined}
    whileHover={shop.isOpen ? { scale: 1.05 } : {}}
    transition="all 0.3s ease"
    opacity={shop.isOpen ? 1 : 0.6}
  >
    {/* Shop Image */}
    <Image
      src={shop.imageUrl}
      alt={shop.name}
      w="full"
      h="200px"
      objectFit="cover"
      filter={!shop.isOpen ? "grayscale(100%) brightness(0.7)" : "brightness(0.8)"}
    />
    
    {/* Shop Details Overlay */}
    <Box
      position="absolute"
      bottom={0}
      left={0}
      right={0}
      bg="rgba(0,0,0,0.6)"
      p={4}
      color="white"
    >
      <Flex justify="space-between" align="center">
        <VStack align="start" spacing={1}>
          <Text 
            fontWeight="bold" 
            fontSize={{ base: 'lg', md: 'xl' }}
            noOfLines={1}
          >
            {shop.name}
          </Text>
          <HStack>
            {shop.rating && (
              <Tag size="sm" colorScheme={!shop.isOpen ? "red" : "green"}>
                <Icon as={FaStar} mr={1} />
                {shop.rating.toFixed(1)}
                {!shop.isOpen && (
                  <Text ml={2} color="white" fontSize="xs">
                    Closed
                  </Text>
                )}
              </Tag>
            )}
            {shop.estimatedDeliveryTime && (
              <Tag size="sm" colorScheme="blue">
                <Icon as={FaClock} mr={1} />
                {shop.estimatedDeliveryTime} min
              </Tag>
            )}
          </HStack>
        </VStack>
      </Flex>
    </Box>
  </MotionBox>
);

// Enhanced Order Card
const OrderCard = ({ order, onViewDetails }) => (
  <MotionBox
    p={5}
    bg="white"
    borderRadius="xl"
    boxShadow="md"
    w="full"
    _hover={{ boxShadow: 'xl' }}
    transition="all 0.3s ease"
    whileHover={{ y: -2 }}
  >
    <Flex 
      justify="space-between" 
      align="center"
      direction={{ base: 'column', sm: 'row' }}
      gap={4}
    >
      <VStack align={{ base: 'center', sm: 'start' }} spacing={2}>
        <Text fontWeight="bold" fontSize={{ base: 'lg', md: 'xl' }}>
          {order.shopName || 'Unknown Shop'}
        </Text>
        <Badge 
          colorScheme={
            order.status === 'completed' ? 'green' : 
            order.status === 'processing' ? 'orange' : 
            'blue'
          }
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </Badge>
      </VStack>
      <Button
        colorScheme="green"
        size={{ base: 'md', md: 'lg' }}
        onClick={() => onViewDetails(order.id)}
        leftIcon={<FaEye />}
        w={{ base: 'full', sm: 'auto' }}
      >
        View Details
      </Button>
    </Flex>
  </MotionBox>
);

const Home = () => {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popularShops, setPopularShops] = useState([]);
  const firestore = getFirestore(app);
  const [isTutorialOpen, setIsTutorialOpen] = useState(true);
  const restaurantButtonRef = React.useRef(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  

  const bgGradient = useColorModeValue(
    'linear(to-br, green.50, teal.50, blue.50)',
    'linear(to-br, green.900, teal.900, blue.900)'
  );

  

  // Fetch Popular Shops
  useEffect(() => {
    const fetchPopularShops = async () => {
      try {
        const shopsRef = collection(firestore, 'shops');
        const popularShopsQuery = query(
          shopsRef, 
          orderBy('createdAt', 'asc'), // Order by creation timestamp, oldest first
          limit(4)
        );
        const querySnapshot = await getDocs(popularShopsQuery);
        
        const shops = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          rating: doc.data().rating || 4.0,
        }));
    
        setPopularShops(shops);
      } catch (error) {
        console.error('Error fetching popular shops:', error);
      }
    };

    fetchPopularShops();
  }, [firestore]);


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsUserLoggedIn(!!user);
  }, []);
  // Fetch Active Orders
  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('User from localStorage:', user);
    
        if (!user) {
          console.log('No user found in localStorage');
          setLoading(false);
          return;
        }
    
        const ordersRef = collection(firestore, 'orders');
        const activeOrdersQuery = query(
          ordersRef, 
          where('userId', '==', user.uid)
          
        );
        
        const querySnapshot = await getDocs(activeOrdersQuery);
        console.log('Total orders found:', querySnapshot.size);
        
        querySnapshot.forEach(doc => {
          console.log('Order document:', {
            id: doc.id,
            data: doc.data()
          });
        });
    
        const unsubscribe = onSnapshot(activeOrdersQuery, (snapshot) => {
          console.log('Snapshot size:', snapshot.size);
          
          const orders = snapshot.docs.map(doc => {
            const orderData = doc.data();
            console.log('Individual order:', {
              id: doc.id,
              userId: orderData.userId,
              status: orderData.status,
              ...orderData
            });
            return {
              id: doc.id,
              ...orderData
            };
          });
          
          setActiveOrders(orders);
          setLoading(false);
        });
    
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching active orders:', error);
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, [firestore]);

  if (loading) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        h="100vh" 
        bg={bgGradient}
      >
        <Spinner 
          size="xl" 
          color="green.500" 
          thickness="4px" 
        />
      </Flex>
    );
  }

  return (
    <Box
      bg={bgGradient}
      minH="100vh"
      py={{ base: 4, md: 8, lg: 16 }}
      px={{ base: 4, md: 6, lg: 8 }}
    >
      <Container maxW="container.xl">
      {activeOrders.length > 0 && (
  <MotionBox
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5 }}
    mb={{ base: 6, md: 8 }}
  >
    <Flex
      bg="green.500"
      p={{ base: 4, md: 6 }}
      borderRadius="2xl"
      align="center"
      justify="space-between"
      boxShadow="xl"
      position="relative"
      overflow="hidden"
    >
      {/* Background Gradient Overlay */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgGradient="linear(to-r, green.600, green.400)"
        opacity={0.9}
        zIndex={1}
      />

      {/* Content */}
      <Flex 
        align="center" 
        position="relative" 
        zIndex={2} 
        w="full"
        direction={{ base: 'column', sm: 'row' }}
        gap={4}
      >
        {/* Order Icon and Details */}
        <Flex align="center" flex={1} gap={4}>
          <Box 
            bg="white" 
            p={3} 
            borderRadius="full" 
            display="flex" 
            alignItems="center" 
            justifyContent="center"
          >
            <Icon
              as={FaShoppingBag}
              boxSize={{ base: 6, md: 8 }}
              color="green.500"
            />
          </Box>
          
          <VStack align="start" spacing={0} color="white">
            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="bold"
            >
              {activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}
            </Text>
            <Text
              fontSize={{ base: 'sm', md: 'md' }}
              color="green.100"
            >
              Track your orders in real-time
            </Text>
          </VStack>
        </Flex>

        {/* View Orders Button */}
        <Button
          variant="solid"
          bg="white"
          color="green.600"
          size={{ base: 'md', md: 'lg' }}
          onClick={() => setIsOrderModalOpen(true)}
          leftIcon={<FaEye />}
          w={{ base: 'full', sm: 'auto' }}
          _hover={{
            bg: 'green.50',
            transform: 'scale(1.05)'
          }}
          transition="all 0.3s ease"
        >
          View Orders
        </Button>
      </Flex>

      {/* Decorative Shapes */}
      <Box
        position="absolute"
        top="-50%"
        right="-10%"
        transform="rotate(45deg)"
        w="200px"
        h="200px"
        bg="green.300"
        opacity={0.3}
        borderRadius="full"
        zIndex={1}
      />
      <Box
        position="absolute"
        bottom="-50%"
        left="-10%"
        transform="rotate(-45deg)"
        w="200px"
        h="200px"
        bg="green.300"
        opacity={0.3}
        borderRadius="full"
        zIndex={1}
      />
    </Flex>
  </MotionBox>
)}
        {/* Hero Section */}
        <VStack
          spacing={{ base: 8, md: 12, lg: 16 }}
          align="center"
          textAlign="center"
          w="full"
          pt={{ base: 4, md: 8, lg: 12 }}
        >
          
          <BannerCarousel/>
          {/* <VStack spacing={6} maxW="800px">
            <Heading
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="black"
              color="teal.800"
              lineHeight="shorter"
            >
              Less Waiting, More Eating!
            </Heading>

            

            
          </VStack> */}
          {/* <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        targetRef={restaurantButtonRef}
        text="Click here to start ordering!"
        arrowDirection="right"
      /> */}

<SimpleGrid
      columns={{ base: 1, sm: 2, lg: 4 }}
      spacing={6}
      w="full"
      maxW="1400px"
      mx="auto"
      px={4}
      bg="white"
      py={8}
    >
      {FOOD_CATEGORIES.map((category, index) => (
        <Flex
          key={index}
          bg="orange.50"
          p={6}
          borderRadius="xl"
          border="2px solid"
          borderColor="orange.100"
          alignItems="center"
          flexDirection="column"
          textAlign="center"
          cursor="pointer"
          transition="all 0.3s ease"
          _hover={{
            transform: 'translateY(-10px)',
            boxShadow: 'xl',
            bg: 'orange.100'
          }}
          onClick={() => navigate('/main')}
        >
          <Icon
            as={category.icon}
            color="orange.500"
            boxSize={16}
            mb={4}
            opacity={0.8}
          />
          <VStack spacing={2} alignItems="center">
            <Text 
              fontWeight="bold" 
              fontSize="2xl" 
              color="orange.700"
            >
              {category.title}
            </Text>
            <Text 
              color="orange.600" 
              fontSize="md"
            >
              {category.description}
            </Text>
          </VStack>
        </Flex>
      ))}
    </SimpleGrid>

          
        </VStack>
        
        {isUserLoggedIn && (
          <>
            <Recommendations />
          
          </>
        )}
        {/* <PremiumRecommendations/> */}
        {/* Popular Restaurants Section */}
        <Box mt={{ base: 8, md: 12, lg: 16 }}>
          <Heading 
            mb={6} 
            textAlign="center"
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }}
            color="teal.800"
          >
            Popular Restaurants Nearby
          </Heading>
          
          <SimpleGrid 
            columns={{ base: 2, md: 4 }}
            spacing={{ base: 4, md: 6, lg: 8 }}
            w="full"
          >
            {popularShops.map((shop) => (
              <PopularShopCard 
                key={shop.id}
                shop={shop}
                onClick={() => navigate(`/shop/${shop.id}`)}
              />
            ))}
          </SimpleGrid>
        </Box>
        {/* Added Pickup Warning */}
        <Alert status="warning" borderRadius="lg" marginTop={7}>
  <AlertIcon />
  <Box>
    <AlertTitle>Pickup Only Service</AlertTitle>
    <AlertDescription>
      We do not offer delivery. Orders are prepared for in-store pickup. 
      Use our app to order, skip the line, and pick up your food with a unique QR code!
      <HStack mt={2} alignItems="center" spacing={2}>
        <Icon as={FaStar} color="green.500" />
        <Text fontSize="sm" color="gray.600">
          Licensed under FSSAI License No. 23624032004962
        </Text>
      </HStack>
    </AlertDescription>
  </Box>
</Alert>
        <Modal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          size="xl"
          motionPreset="slideInBottom"
          scrollBehavior="inside"
        >
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent 
            borderRadius="xl" 
            mx={4}
            bg="white"
          >
            <ModalHeader fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold">
              Your Active Orders
            </ModalHeader>
            <ModalCloseButton />
            <Divider />
            <ModalBody py={6}>
              <VStack spacing={4}>
                {activeOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(orderId) => {
                      navigate(`/order-waiting/${orderId}`);
                      setIsOrderModalOpen(false);
                    }}
                  />
                ))}
              </VStack>
            </ModalBody>
            <Divider />
            <ModalFooter>
              <Button 
                onClick={() => setIsOrderModalOpen(false)} 
                size="lg"
                w={{ base: 'full', sm: 'auto' }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default Home;