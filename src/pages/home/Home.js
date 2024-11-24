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
  Divider
} from '@chakra-ui/react';
import { FaUtensils, FaGift, FaShoppingBag, FaEye } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { app } from '../../Components/firebase/Firebase';

// Import images
import pic1 from "../../Assets/WhatsApp Image 2024-11-20 at 10.00.05 PM.jpeg"
import pic2 from "../../Assets/WhatsApp Image 2024-11-20 at 10.00.18 PM.jpeg"
import pic3 from "../../Assets/WhatsApp Image 2024-11-20 at 9.59.19 PM.jpeg"
import pic4 from "../../Assets/Untitled design (1) (1).png"

// Motion components
const MotionBox = chakra(motion.div);
const MotionFlex = chakra(motion.div);

// Constants
const FOOD_CATEGORIES = [
  { icon: FaUtensils, title: 'Restaurant', description: 'Explore our delicious menu' },
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
          Order #{order.id.slice(-6)}
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
  const [loading, setLoading] = useState(true);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const firestore = getFirestore(app);

  const bgGradient = useColorModeValue(
    'linear(to-br, green.50, teal.50, blue.50)',
    'linear(to-br, green.900, teal.900, blue.900)'
  );

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
          setLoading(false);
          return;
        }

        const ordersRef = collection(firestore, 'orders');
        const activeOrdersQuery = query(
          ordersRef, 
          where('userId', '==', user.uid),
          where('status', 'in', ['pending', 'processing', 'completed'])
        );
        
        const unsubscribe = onSnapshot(activeOrdersQuery, (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
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
      <Flex justify="center" align="center" h="100vh" bg={bgGradient}>
        <Spinner size="xl" color="green.500" thickness="4px" />
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
        {/* Active Orders Banner */}
        {activeOrders.length > 0 && (
          <MotionBox
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            mb={{ base: 6, md: 8 }}
          >
            <Box
              bg="white"
              p={{ base: 4, md: 6 }}
              borderRadius="2xl"
              boxShadow="xl"
              border="1px"
              borderColor="green.100"
            >
              <Flex 
                align="center" 
                justify="space-between"
                direction={{ base: 'column', sm: 'row' }}
                gap={4}
              >
                <Flex align="center" gap={4}>
                  <Icon 
                    as={FaShoppingBag} 
                    boxSize={{ base: 6, md: 8 }} 
                    color="green.500" 
                  />
                  <VStack align="start" spacing={0}>
                    <Text 
                      fontSize={{ base: 'lg', md: 'xl' }} 
                      fontWeight="bold" 
                      color="gray.800"
                    >
                      {activeOrders.length} Active Order{activeOrders.length > 1 ? 's' : ''}
                    </Text>
                    <Text 
                      fontSize={{ base: 'sm', md: 'md' }} 
                      color="gray.600"
                    >
                      Track your orders in real-time
                    </Text>
                  </VStack>
                </Flex>
                <Button
                  colorScheme="green"
                  size={{ base: 'md', md: 'lg' }}
                  onClick={() => setIsOrderModalOpen(true)}
                  leftIcon={<FaEye />}
                  w={{ base: 'full', sm: 'auto' }}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                >
                  View Orders
                </Button>
              </Flex>
            </Box>
          </MotionBox>
        )}

        {/* Main Content */}
        <Flex
          direction={{ base: 'column', lg: 'row' }}
          align="center"
          justify="space-between"
          gap={{ base: 8, md: 12, lg: 16 }}
        >
          {/* Left Section */}
          <MotionBox
            w={{ base: 'full', lg: '50%' }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <VStack spacing={{ base: 6, md: 8 }} align="start" w="full">
              <Heading
                fontSize={{ base: '3xl', md: '4xl', lg: '5xl', xl: '6xl' }}
                fontWeight="black"
                lineHeight="shorter"
                color="teal.800"
                letterSpacing="tight"
                textAlign={{ base: 'center', lg: 'left' }}
                w="full"
              >
                Order right from your table!
              </Heading>

              {/* Image Carousel */}
              <Box 
                w="full" 
                borderRadius="2xl" 
                overflow="hidden" 
                boxShadow="2xl"
                bg="white"
              >
                <Slider {...CAROUSEL_SETTINGS}>
                  {[pic1, pic2, pic3].map((pic, index) => (
                    <Box key={index} position="relative" pb="56.25%">
                      <Image
                        src={pic}
                        alt={`Slide ${index + 1}`}
                        position="absolute"
                        top={0}
                        left={0}
                        w="full"
                        h="full"
                        objectFit="cover"
                      />
                    </Box>
                  ))}
                </Slider>
              </Box>

              {/* Categories Grid */}
              <SimpleGrid 
                columns={{ base: 1, sm: 2 }} 
                spacing={{ base: 4, md: 6 }} 
                w="full"
                pt={{ base: 4, md: 6 }}
              >
                {FOOD_CATEGORIES.map((category, index) => (
                  <FoodCategory
                    key={index}
                    {...category}
                    onClick={() => navigate('/main')}
                  />
                ))}
              </SimpleGrid>
            </VStack>
          </MotionBox>

          {/* Right Section - Hero Image */}
          <MotionBox
            w={{ base: 'full', lg: '45%' }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src={pic4}
              alt="Food Delivery"
              borderRadius="3xl"
              boxShadow="2xl"
              w="full"
              h="auto"
              objectFit="cover"
              loading="lazy"
            />
          </MotionBox>
        </Flex>

        {/* Active Orders Modal */}
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