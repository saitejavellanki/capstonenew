import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  InputGroup,
  InputLeftElement,
  Input,
  Icon
} from '@chakra-ui/react';
import { FaSearch, FaQuestionCircle, FaShoppingCart, FaUser, FaCreditCard } from 'react-icons/fa';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      category: 'Getting Started',
      icon: FaQuestionCircle,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account is easy! Click on the "Sign Up" button, fill in your details, and verify your email address.'
        },
        {
          question: 'Is the app free to use?',
          answer: 'The FOST app is free to use. We only charge for the meals you order.'
        }
      ]
    },
    {
      category: 'Ordering',
      icon: FaShoppingCart,
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Browse local food stalls, select your items, customize if needed, and proceed to checkout. It\'s that simple!'
        },
        {
          question: 'Can I cancel an order?',
          answer: 'Orders can be canceled before the stall starts preparing your meal. Check the specific cancellation policy in the app.'
        }
      ]
    },
    {
      category: 'Account Management',
      icon: FaUser,
      faqs: [
        
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login screen, enter your email, and follow the reset instructions.'
        }
      ]
    },
    {
      category: 'Payments',
      icon: FaCreditCard,
      faqs: [
        
        {
          question: 'Is my payment information secure?',
          answer: 'Yes, we use industry-standard encryption to protect your payment information.'
        }
      ]
    }
  ];

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <Box bg="gray.50" minHeight="100vh" py={16}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading 
              as="h1" 
              size="2xl" 
              color="orange.500" 
              mb={4}
            >
              Help Center
            </Heading>
            <Text 
              color="gray.600" 
              maxW="700px" 
              mx="auto"
            >
              Welcome to FOST's Help Center. Find answers to your questions or contact 
              our support team for personalized assistance.
            </Text>
          </Box>

          <InputGroup mb={8}>
            <InputLeftElement pointerEvents="none">
              <Icon as={FaSearch} color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search frequently asked questions..." 
              size="lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              focusBorderColor="orange.500"
            />
          </InputGroup>

          {filteredFAQs.map((category, catIndex) => (
            <Box key={catIndex} bg="white" borderRadius="xl" boxShadow="md" mb={6}>
              <Box 
                bg="orange.500" 
                color="white" 
                p={4} 
                borderTopRadius="xl"
                display="flex"
                alignItems="center"
              >
                <Icon as={category.icon} mr={3} />
                <Heading size="md">{category.category}</Heading>
              </Box>
              <Accordion allowToggle>
                {category.faqs.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} border="none">
                    <AccordionButton 
                      _hover={{ bg: 'gray.100' }}
                      borderBottom="1px solid"
                      borderColor="gray.200"
                    >
                      <Box flex="1" textAlign="left">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel pb={4} bg="gray.50">
                      {faq.answer}
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </Box>
          ))}

          {filteredFAQs.length === 0 && (
            <Box 
              textAlign="center" 
              bg="white" 
              p={8} 
              borderRadius="xl" 
              boxShadow="md"
            >
              <Text color="gray.600">
                No FAQs found. Try a different search term or 
                <Text as="span" color="orange.500" ml={1}>
                  contact our support team
                </Text>
                .
              </Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default HelpCenter;