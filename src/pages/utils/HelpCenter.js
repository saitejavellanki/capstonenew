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
  Icon,
  Button,
  Flex,
  Link,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { 
  FaSearch, 
  FaQuestionCircle, 
  FaShoppingCart, 
  FaUser, 
  FaCreditCard,
  FaEnvelope,
  FaPhoneAlt,
  FaDesktop,
  FaGlobe
} from 'react-icons/fa';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqCategories = [
    {
      category: 'Getting Started',
      icon: FaDesktop,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Creating an account on FOST is simple! Navigate to the "Sign Up" page on our website, fill in your details with a valid email address, and verify your account through the confirmation email sent to you.'
        },
        {
          question: 'Is the platform free to use?',
          answer: 'FOST is free to use. We only charge for the meals you order. There are no hidden fees or subscription costs. Browse, order, and enjoy your favorite food stall meals!'
        },
        {
          question: 'What browsers are supported?',
          answer: 'FOST is a web-based platform compatible with modern browsers. We recommend using the latest versions of Google Chrome, Mozilla Firefox, Safari, or Microsoft Edge for the best experience.'
        }
      ]
    },
    {
      category: 'Ordering',
      icon: FaShoppingCart,
      faqs: [
        {
          question: 'How do I place an order?',
          answer: 'Browse food stalls on our website, select your desired items, customize your order if needed (add special instructions or note dietary requirements), review your selection, and proceed to checkout. You can track your order status in real-time through our web platform.'
        },
        {
          question: 'Can I cancel an order?',
          answer: 'Orders can be canceled before the stall starts preparing your meal. Once preparation begins, cancellation is not possible. Please refer to our detailed Cancellation Policy for specific guidelines.'
        },
        {
          question: 'How do I track my order?',
          answer: 'After placing an order, you can track its status in real-time on our website. The platform provides updates from order confirmation to preparation and when it\'s ready for pickup. You\'ll receive on-screen notifications at each stage.'
        }
      ]
    },
    {
      category: 'Account Management',
      icon: FaUser,
      faqs: [
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your registered email address, and follow the password reset instructions sent to your email. If you encounter any issues, contact our support team.'
        },
        {
          question: 'Can I update my profile information?',
          answer: 'Yes, you can update your profile details by navigating to the "Account Settings" section on our website. Here you can modify your contact information, preferences, and other account-related details.'
        }
      ]
    },
    {
      category: 'Payments',
      icon: FaCreditCard,
      faqs: [
        {
          question: 'Is my payment information secure?',
          answer: 'We use industry-standard encryption and secure payment gateways to protect your financial information. All transactions are processed through trusted and verified payment processors.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'FOST supports multiple payment methods including credit/debit cards, net banking, UPI, and digital wallets. Choose the most convenient option during checkout.'
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

          <Alert 
            status="info" 
            variant="subtle" 
            borderRadius="xl" 
            mb={6}
          >
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Need More Help?</Text>
              <Text>
                Our support team is ready to assist you. Reach out via email at{' '}
                <Link 
                  href="mailto:team@thefost.com" 
                  color="orange.500" 
                  fontWeight="bold"
                >
                  team@thefost.com
                </Link>
              </Text>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default HelpCenter;