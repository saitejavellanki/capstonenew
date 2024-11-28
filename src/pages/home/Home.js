import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Container,
  SimpleGrid,
  useColorModeValue,
  chakra,
  Spinner,
} from '@chakra-ui/react';
import { FaUtensils } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getFirestore } from 'firebase/firestore'; 
import { app } from '../../Components/firebase/Firebase'; 
import PromotionalCarousel from './PromotionalCarousel'; // Import your carousel component

// Enhanced Motion Components
const MotionBox = chakra(motion.div);
const MotionFlex = chakra(motion.div);

// Constants
const FOOD_CATEGORIES = [
  { icon: FaUtensils, title: 'Restaurant', description: 'Explore our delicious menu' }
];

// Food Category Component
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
    whileHover={{ 
      scale: 1.03,
      rotate: 1,
      transition: { duration: 0.2 }
    }}
    whileTap={{ scale: 0.98 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ 
      duration: 0.5, 
      type: "spring", 
      stiffness: 100 
    }}
    _hover={{
      boxShadow: '2xl',
      bg: 'green.50'
    }}
    h="full"
    w="full"
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

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore(app);

  const bgGradient = useColorModeValue(
    'linear(to-br, green.50, teal.50, blue.50)',
    'linear(to-br, green.900, teal.900, blue.900)'
  );

  useEffect(() => {
    // Simulating loading with a timeout
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Flex 
        justify="center" 
        align="center" 
        h="100vh" 
        bg={bgGradient}
      >
        <MotionBox
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Spinner size="xl" color="green.500" thickness="4px" />
        </MotionBox>
      </Flex>
    );
  }

  return (
    <Box
      bg={bgGradient}
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 4, md: 8, lg: 16 }}
      px={{ base: 4, md: 6, lg: 8 }}
    >
      <Container maxW="container.xl">
        <VStack 
          spacing={{ base: 6, md: 8, lg: 10 }} 
          w="full" 
          align="stretch"
        >
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 12, 
              type: "spring", 
              stiffness: 70 
            }}
          >
            <PromotionalCarousel />
          </MotionBox>

          <Flex
            direction={{ base: 'column', lg: 'row' }}
            align="center"
            justify="space-between"
            gap={{ base: 8, md: 12, lg: 16 }}
          >
            <MotionBox
              w={{ base: 'full', lg: '50%' }}
              pr={{ lg: 8 }}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                type: "spring", 
                stiffness: 70 
              }}
            >
              <VStack spacing={{ base: 6, md: 8 }} align="start" w="full">
                <Text 
                  fontSize={{ base: '3xl', md: '4xl', lg: '5xl', xl: '6xl' }}
                  fontWeight="black"
                  lineHeight="shorter"
                  color="teal.800"
                  letterSpacing="tight"
                  textAlign={{ base: 'center', lg: 'left' }}
                  w="full"
                >
                  Order from where you sit!
                </Text>

                <Text
                  fontSize={{ base: 'lg', md: 'xl' }} 
                  color="gray.700"
                  textAlign={{ base: 'center', lg: 'left' }}
                >
                  Discover delicious meals from our food stalls. Convenient, quick, and tasty ordering.
                </Text>
              </VStack>
            </MotionBox>
            <MotionBox
              w={{ base: 'full', lg: '50%' }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                type: "spring", 
                stiffness: 70 
              }}
            >
              <SimpleGrid 
                columns={1} 
                spacing={{ base: 4, md: 6 }} 
                w="full"
              >
                {FOOD_CATEGORIES.map((category, index) => (
                  <FoodCategory
                    key={index}
                    {...category}
                    onClick={() => navigate('/main')}
                  />
                ))}
              </SimpleGrid>
            </MotionBox>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;
