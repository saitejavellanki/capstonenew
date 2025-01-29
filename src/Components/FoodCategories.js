import React from 'react';
import { Box, SimpleGrid, Flex, Icon, Text, VStack, useColorModeValue, Container } from '@chakra-ui/react';
import { FaUtensils, FaGift, FaShoppingBasket } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FOOD_CATEGORIES = [
  {
    icon: FaUtensils,
    title: 'Food Courts',
    description: 'Explore our delicious menu options',
    route: '/main'
  },
  {
    icon: FaShoppingBasket,
    title: 'Groceries',
    description: 'Fresh products delivered to you',
    route: '/groceriesbyfost'
  },
];

const FoodCategories = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const descColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Container maxW="container.xl" py={{ base: 4, md: 6 }}>
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3 }}
        spacing={{ base: 4, md: 6 }}
        w="full"
        mx="auto"
      >
        {FOOD_CATEGORIES.map((category, index) => (
          <Flex
            key={index}
            bg={bgColor}
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
              bg: hoverBg,
              borderColor: 'blue.200'
            }}
            onClick={() => navigate(category.route)}
            role="button"
            tabIndex={0}
            h="full"
          >
            <Icon
              as={category.icon}
              color={iconColor}
              boxSize={{ base: 8, md: 10 }}
              mb={4}
            />
            <VStack spacing={3} alignItems="center">
              <Text
                fontWeight="bold"
                fontSize={{ base: "lg", md: "xl" }}
                color={titleColor}
              >
                {category.title}
              </Text>
              <Text
                color={descColor}
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="tall"
                maxW="xs"
              >
                {category.description}
              </Text>
            </VStack>
          </Flex>
        ))}
      </SimpleGrid>
    </Container>
  );
};

export default FoodCategories;