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
  // {
  //   icon: FaShoppingBasket,
  //   title: 'Groceries',
  //   description: 'Fresh products delivered to you',
  //   route: '/groceriesbyfost'
  // },
];

const FoodCategories = () => {
  const navigate = useNavigate();
  const iconColor = useColorModeValue('orange.500', 'orange.300');
  const titleColor = 'black';
  const descColor = 'gray.600';

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
            bg="white"
            p={{ base: 6, md: 8 }}
            borderRadius="xl"
            border="2px solid black"
            boxShadow="6px 6px 0 black"
            alignItems="center"
            flexDirection="column"
            textAlign="center"
            cursor="pointer"
            transition="all 0.2s ease"
            _hover={{
              transform: "translate(-2px, -2px)",
              boxShadow: "8px 8px 0 black"
            }}
            _active={{
              transform: "translate(0px, 0px)",
              boxShadow: "2px 2px 0 black"
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