import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaCartPlus, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

// Star Rating Component
const StarRating = ({ rating }) => {
  return (
    <HStack spacing={1}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          as={FaStar}
          color={star <= rating ? "yellow.400" : "gray.200"}
          w={3}
          h={3}
        />
      ))}
      <Text fontSize="xs" color="gray.600" ml={1}>
        {rating?.toFixed(1) || '0.0'}
      </Text>
    </HStack>
  );
};

const ShopItemCard = ({ item, onAddToCart, onItemClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useBreakpointValue({ base: true, sm: false });

  const mobileCard = (
    <MotionBox
      position="relative"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      cursor="pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      height="120px"
      opacity={item.isActive === false ? 0.6 : 1}
    >
      <Flex h="full">
        {/* Left side - Image */}
        <Box position="relative" w="120px" h="full">
          <Image
            src={item.imageUrl || '/placeholder-food.jpg'}
            alt={item.name}
            h="full"
            w="full"
            objectFit="cover"
            onClick={() => onItemClick(item)}
          />
          <Box
            position="absolute"
            top={2}
            left={2}
            right={2}
            display="flex"
            justifyContent="space-between"
            gap={2}
          >
            <Box 
              bg="white" 
              borderRadius="full" 
              w="2" 
              h="2" 
              border="1px"
              borderColor={item.dietType === 'veg' ? 'green.500' : 'red.500'}
            >
              <Box
                w="1"
                h="1"
                borderRadius="full"
                bg={item.dietType === 'veg' ? 'green.500' : 'red.500'}
                m="0.5"
              />
            </Box>
            {item.isActive === false && (
              <Badge
                colorScheme="red"
                fontSize="xs"
                px={2}
                py={0.5}
                borderRadius="full"
              >
                Unavailable
              </Badge>
            )}
          </Box>
        </Box>

        {/* Right side - Content */}
        <Flex 
          flex={1} 
          direction="column" 
          justify="space-between"
          p={3}
        >
          <VStack align="start" spacing={1}>
            <Heading size="sm" noOfLines={1}>
              {item.name}
            </Heading>
            <StarRating rating={item.averageRating} />
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {item.description}
            </Text>
          </VStack>

          <Flex justify="space-between" align="center" w="full">
            <Text 
              color="green.600" 
              fontWeight="bold"
              fontSize="sm"
            >
              ₹{item.price}
            </Text>
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<FaCartPlus size={12} />}
              variant="ghost"
              onClick={() => onAddToCart(item)}
              isDisabled={item.isActive === false}
              _hover={{
                bg: 'orange.100',
              }}
            >
              Add
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </MotionBox>
  );

  const desktopCard = (
    <MotionBox
      position="relative"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      boxShadow="lg"
      cursor="pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      opacity={item.isActive === false ? 0.6 : 1}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient: 'linear(to-br, orange.50, yellow.50)',
        opacity: 0,
        transition: '0.3s',
        zIndex: 0,
      }}
      _hover={{
        _before: {
          opacity: 1,
        },
        transform: 'translateY(-8px)',
        boxShadow: '2xl',
      }}
    >
      <Box position="relative" overflow="hidden">
        <Image
          src={item.imageUrl || '/placeholder-food.jpg'}
          alt={item.name}
          h="180px"
          w="full"
          objectFit="cover"
          transition="0.3s"
          transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
          onClick={() => onItemClick(item)}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.400"
          opacity={isHovered ? 1 : 0}
          transition="0.3s"
        />
        <Box
          position="absolute"
          top={2}
          left={2}
          right={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Box 
            bg="white" 
            borderRadius="full" 
            w="3" 
            h="3" 
            border="1px"
            borderColor={item.dietType === 'veg' ? 'green.500' : 'red.500'}
          >
            <Box
              w="1.5"
              h="1.5"
              borderRadius="full"
              bg={item.dietType === 'veg' ? 'green.500' : 'red.500'}
              m="0.5"
            />
          </Box>
          {item.isActive === false && (
            <Badge
              colorScheme="red"
              fontSize="xs"
              px={2}
              py={0.5}
              borderRadius="full"
            >
              Unavailable
            </Badge>
          )}
        </Box>
        <Box
          position="absolute"
          bottom={2}
          left={2}
          bg="white"
          px={2}
          py={1}
          borderRadius="md"
        >
          <StarRating rating={item.averageRating} />
        </Box>
      </Box>

      <VStack 
        p={4} 
        align="start" 
        spacing={3}
        position="relative"
        bg={isHovered ? 'white' : 'transparent'}
        transition="0.3s"
      >
        <Heading size="md" noOfLines={1}>
          {item.name}
        </Heading>
        <Text color="gray.600" fontSize="sm" noOfLines={2}>
          {item.description}
        </Text>
        <Flex justify="space-between" align="center" w="full">
          <Text 
            color="green.600" 
            fontWeight="bold"
            fontSize="lg"
          >
            ₹{item.price}
          </Text>
          <MotionFlex
            animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<FaCartPlus />}
              variant="ghost"
              onClick={() => onAddToCart(item)}
              isDisabled={item.isActive === false}
              _hover={{
                bg: 'orange.100',
              }}
            >
              Add to Cart
            </Button>
          </MotionFlex>
        </Flex>
      </VStack>
    </MotionBox>
  );

  return isMobile ? mobileCard : desktopCard;
};

export default ShopItemCard;