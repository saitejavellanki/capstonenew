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

const VegNonVegIndicator = ({ isVeg, size = "md" }) => {
  const sizes = {
    sm: { outer: "14px", inner: "6px" },
    md: { outer: "20px", inner: "10px" },
    lg: { outer: "24px", inner: "12px" }
  };
  
  return (
    <Box
      position="relative"
      width={sizes[size].outer}
      height={sizes[size].outer}
      p="2px"
      bg="white"
      borderRadius="sm"
      border="1px solid"
      borderColor={isVeg ? "green.500" : "red.500"}
    >
      <Box
        width={sizes[size].inner}
        height={sizes[size].inner}
        bg={isVeg ? "green.500" : "red.500"}
        borderRadius="sm"
      />
    </Box>
  );
};

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
  const isMobile = useBreakpointValue({ base: true, md: false });

  const MobileCard = () => (
    <MotionBox
      position="relative"
      bg="white"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="6px 6px 0 black"
      border="2px solid black"
      cursor="pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      height="120px"
      opacity={item.isActive === false ? 0.6 : 1}
      transition="all 0.2s"
      _hover={{
        transform: "translate(-2px, -2px)",
        boxShadow: "8px 8px 0 black"
      }}
    >
      {!item.isActive && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="red"
          zIndex={2}
        >
          Unavailable
        </Badge>
      )}

      <Flex h="full">
        <Box position="relative" w="120px" h="full">
          <Image
            src={item.imageUrl || '/placeholder-food.jpg'}
            alt={item.name}
            h="full"
            w="full"
            objectFit="cover"
            onClick={() => onItemClick(item)}
          />
          <Box position="absolute" top={2} left={2}>
            <VegNonVegIndicator isVeg={item.dietType === 'veg'} size="sm" />
          </Box>
        </Box>

        <Flex flex={1} direction="column" justify="space-between" p={3}>
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
            <Text color="green.600" fontWeight="bold" fontSize="sm">
              ₹{item.price}
            </Text>
            <Button
              size="sm"
              bg="white"
              color="black"
              border="2px solid black"
              boxShadow="4px 4px 0 black"
              _hover={{
                transform: "translate(-2px, -2px)",
                boxShadow: "6px 6px 0 black"
              }}
              _active={{
                transform: "translate(0px, 0px)",
                boxShadow: "2px 2px 0 black"
              }}
              leftIcon={<FaCartPlus size={12} />}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item);
              }}
              isDisabled={!item.isActive}
            >
              Add
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </MotionBox>
  );

  const DesktopCard = () => (
    <MotionBox
      position="relative"
      bg="white"
      borderRadius="xl"
      overflow="hidden"
      border="2px solid black"
      boxShadow="6px 6px 0 black"
      cursor="pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition="all 0.2s"
      _hover={{
        transform: "translate(-2px, -2px)",
        boxShadow: "8px 8px 0 black"
      }}
      opacity={item.isActive === false ? 0.6 : 1}
    >
      {!item.isActive && (
        <Badge
          position="absolute"
          top={2}
          right={2}
          colorScheme="red"
          zIndex={2}
        >
          Unavailable
        </Badge>
      )}

      <Box position="relative">
        <Image
          src={item.imageUrl || '/placeholder-food.jpg'}
          alt={item.name}
          h="200px"
          w="full"
          objectFit="cover"
          transition="transform 0.3s"
          transform={isHovered ? 'scale(1.1)' : 'scale(1)'}
          onClick={() => onItemClick(item)}
        />
        
        <Box position="absolute" top={3} left={3} zIndex={1}>
          <VegNonVegIndicator isVeg={item.dietType === 'veg'} size="md" />
        </Box>

        <Box
          position="absolute"
          bottom={3}
          left={3}
          bg="white"
          px={2}
          py={1}
          borderRadius="md"
          boxShadow="sm"
        >
          <StarRating rating={item.averageRating} />
        </Box>

        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.300"
          opacity={isHovered ? 1 : 0}
          transition="opacity 0.3s"
        />
      </Box>

      <VStack
        p={4}
        align="start"
        spacing={3}
        bg={isHovered ? 'white' : 'transparent'}
        transition="background-color 0.3s"
      >
        <Heading size="md" noOfLines={1}>
          {item.name}
        </Heading>
        <Text color="gray.600" fontSize="sm" noOfLines={2}>
          {item.description}
        </Text>
        <Flex justify="space-between" align="center" w="full">
          <Text color="green.600" fontWeight="bold" fontSize="lg">
            ₹{item.price}
          </Text>
          <Button
            bg="white"
            color="black"
            border="2px solid black"
            boxShadow="4px 4px 0 black"
            _hover={{
              transform: "translate(-2px, -2px)",
              boxShadow: "6px 6px 0 black"
            }}
            _active={{
              transform: "translate(0px, 0px)",
              boxShadow: "2px 2px 0 black"
            }}
            leftIcon={<FaCartPlus />}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            isDisabled={!item.isActive}
          >
            Add to Cart
          </Button>
        </Flex>
      </VStack>
    </MotionBox>
  );

  return isMobile ? <MobileCard /> : <DesktopCard />;
};

export default ShopItemCard;