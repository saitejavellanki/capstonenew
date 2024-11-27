import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  chakra,
  Flex,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';

const AboutUs = () => {
  return (
    <Box bg="white" minHeight="100vh">
      {/* Hero Section */}
      <Box 
        bg="orange.500" 
        color="white" 
        py={20} 
        textAlign="center"
      >
        <Container maxW="6xl">
          <Heading 
            fontSize={['3xl', '4xl', '5xl']} 
            fontWeight="bold" 
            mb={4}
          >
            Our Story: Simplifying Food Experience
          </Heading>
          <Text 
            maxW="xl" 
            mx="auto" 
            fontSize={['md', 'lg']} 
            opacity={0.9}
          >
            Born from a passion to connect food lovers with local culinary gems and simplify their ordering experience
          </Text>
        </Container>
      </Box>

      {/* Motivation Section */}
      <Container maxW="6xl" py={16}>
        <SimpleGrid columns={[1, null, 2]} spacing={12} alignItems="center">
          <VStack 
            spacing={6} 
            align="start" 
            bg="orange.50" 
            p={8} 
            borderRadius="xl"
          >
            <Heading 
              color="orange.600" 
              fontSize="2xl" 
              borderBottomWidth={2} 
              borderColor="orange.500" 
              pb={2}
            >
              Our Motivation
            </Heading>
            <Text color="gray.700" lineHeight="tall">
              We started FOST with a simple yet powerful vision: to bridge the gap between hungry customers 
              and incredible local food stalls that often go unnoticed. Our founders experienced the frustration 
              of long queues, complicated ordering processes, and the challenge of discovering hidden culinary 
              treasures in local markets.
            </Text>
            <Text color="gray.700" lineHeight="tall">
              Our platform isn't just about ordering food—it's about supporting local businesses, 
              reducing wait times, and creating a seamless connection between food enthusiasts and 
              passionate food vendors.
            </Text>
          </VStack>

          <VStack spacing={6}>
            <Box 
              bg="orange.100" 
              p={8} 
              borderRadius="xl" 
              width="full"
            >
              <Heading 
                color="orange.600" 
                fontSize="xl" 
                mb={4}
              >
                Key Objectives
              </Heading>
              <VStack align="start" spacing={4}>
                {[
                  "Empower local food vendors",
                  "Simplify food ordering process",
                  "Reduce customer waiting time",
                  "Enhance food discovery experience"
                ].map((objective, index) => (
                  <Flex key={index} align="center">
                    <Icon 
                      viewBox="0 0 20 20" 
                      color="orange.500" 
                      mr={3}
                    >
                      <path 
                        fill="currentColor" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      />
                    </Icon>
                    <Text color="gray.700">{objective}</Text>
                  </Flex>
                ))}
              </VStack>
            </Box>

            <Box 
              bg="orange.100" 
              p={8} 
              borderRadius="xl" 
              width="full"
            >
              <Heading 
                color="orange.600" 
                fontSize="xl" 
                mb={4}
              >
                Our Promise
              </Heading>
              <Text color="gray.700" lineHeight="tall">
                We promise to continuously innovate, support local food ecosystems, 
                and create an intuitive platform that makes food ordering a delightful experience.
              </Text>
            </Box>
          </VStack>
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default AboutUs;