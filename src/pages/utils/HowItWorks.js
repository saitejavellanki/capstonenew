import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Flex,
  SimpleGrid,
  Icon,
  Stack,
  Divider
} from '@chakra-ui/react';
import { 
  ChevronRightIcon,
  CheckCircleIcon,
  TimeIcon,
  PhoneIcon 
} from '@chakra-ui/icons';

const HowItWorks = () => {
  const workflowSteps = [
    {
      number: '01',
      title: "Online Selection",
      description: "Browse curated menus from local food stalls. Select your items, customize preferences, and review your order with precision.",
      icon: PhoneIcon
    },
    {
      number: '02', 
      title: "Instant Order Processing",
      description: "Your order is immediately transmitted to the selected vendor. Real-time confirmation ensures accuracy and availability.",
      icon: CheckCircleIcon
    },
    {
      number: '03',
      title: "Tracked Preparation",
      description: "Monitor your order's progress through our intuitive tracking system. Stay informed about preparation status in real-time.",
      icon: TimeIcon
    },
    {
      number: '04',
      title: "Seamless Pickup",
      description: "Receive instant notification when your order is ready. Collect your meal efficiently with a unique pickup code.",
      icon: ChevronRightIcon
    }
  ];

  return (
    <Box bg="white" position="relative" overflow="hidden">
      {/* Gradient Background */}
      <Box 
        position="absolute" 
        top="0" 
        left="0" 
        right="0" 
        height="400px" 
        bgGradient="linear(to-r, orange.400, orange.600)"
        zIndex="0"
      />

      <Container 
        maxW="6xl" 
        position="relative" 
        zIndex="10" 
        pt={20} 
        pb={16}
      >
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <VStack 
            spacing={4} 
            textAlign="center" 
            color="white"
            mb={12}
          >
            <Heading 
              fontSize={['3xl', '4xl', '5xl']} 
              fontWeight="bold"
            >
              How FOST Works
            </Heading>
            <Text 
              maxW="xl" 
              fontSize="xl" 
              fontWeight="light"
              opacity={0.9}
            >
              Transforming food ordering into a streamlined, efficient experience
            </Text>
          </VStack>

          {/* Workflow Steps */}
          <SimpleGrid 
            columns={[1, null, 4]} 
            spacing={8}
            position="relative"
          >
            {workflowSteps.map((step, index) => (
              <VStack 
                key={step.title}
                align="start"
                bg="white"
                boxShadow="xl"
                borderRadius="xl"
                p={6}
                spacing={4}
                transition="all 0.3s"
                _hover={{
                  transform: "translateY(-10px)",
                  boxShadow: "2xl"
                }}
              >
                <Flex 
                  width="full" 
                  justifyContent="space-between" 
                  alignItems="center"
                >
                  <Text 
                    fontSize="3xl" 
                    fontWeight="bold" 
                    color="orange.500"
                  >
                    {step.number}
                  </Text>
                  <Icon 
                    as={step.icon} 
                    w={8} 
                    h={8} 
                    color="orange.500"
                  />
                </Flex>
                <VStack align="start" spacing={2}>
                  <Heading 
                    fontSize="xl" 
                    color="gray.800"
                  >
                    {step.title}
                  </Heading>
                  <Text 
                    color="gray.600" 
                    fontSize="md"
                  >
                    {step.description}
                  </Text>
                </VStack>
              </VStack>
            ))}
          </SimpleGrid>

          {/* Value Proposition */}
          <Box 
            bg="orange.50" 
            borderRadius="xl" 
            p={12} 
            mt={12}
          >
            <VStack spacing={6}>
              <Heading 
                textAlign="center" 
                color="gray.800" 
                fontSize="2xl"
              >
                Why Choose FOST
              </Heading>
              <SimpleGrid columns={[1, null, 3]} spacing={8}>
                {[
                  {
                    title: "Efficiency",
                    description: "Minimize wait times and streamline your food ordering process."
                  },
                  {
                    title: "Transparency",
                    description: "Real-time order tracking with complete visibility."
                  },
                  {
                    title: "Convenience",
                    description: "Order, track, and pickup with unprecedented ease."
                  }
                ].map((value) => (
                  <VStack 
                    key={value.title}
                    bg="white" 
                    p={6} 
                    borderRadius="lg"
                    boxShadow="md"
                    spacing={4}
                    align="center"
                  >
                    <Heading 
                      fontSize="xl" 
                      color="orange.600"
                    >
                      {value.title}
                    </Heading>
                    <Text 
                      textAlign="center" 
                      color="gray.600"
                    >
                      {value.description}
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HowItWorks;