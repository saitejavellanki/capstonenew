import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  IconButton,
  Button,
  VStack,
  Heading,
  Flex,
  Link,
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const socialLinks = [
    {
      label: 'twitter',
      icon: <FaTwitter size="20px" />,
      href: 'https://x.com/FOST_4',
    },
    {
      label: 'instagram',
      icon: <FaInstagram size="20px" />,
      href: 'https://www.instagram.com/fost_service/',
    },
    {
      label: 'youtube',
      icon: <FaYoutube size="20px" />,
      href: 'https://www.youtube.com/@the_fost',
    },
    {
      label: 'linkedin',
      icon: <FaLinkedin size="20px" />,
      href: 'https://www.linkedin.com/search/results/all/?keywords=fost&origin=GLOBAL_SEARCH_HEADER&sid=i.V',
      color: '#0A66C2'
    },
  ];

  return (
    <Box 
      as="footer" 
      position="relative" 
      mt={20}
    >
      <Box
        bg="orange.500"
        borderTopRadius="3xl"
        color="white"
        position="relative"
        overflow="hidden"
        px={4}
      >
        <Container maxW="7xl" py={16}>
          <Flex 
            direction={{ base: 'column', lg: 'row' }}
            justify="space-between"
            mb={16}
            align={{ base: 'center', lg: 'flex-start' }}
          >
            <VStack align={{ base: 'center', lg: 'flex-start' }} mb={{ base: 8, lg: 0 }}>
              <Heading 
                fontSize="4xl" 
                fontWeight="black"
                letterSpacing="wider"
              >
                FOST
              </Heading>
              <Text 
                maxW="400px" 
                textAlign={{ base: 'center', lg: 'left' }}
                color="whiteAlpha.900"
                fontSize="sm"
                mt={4}
              >
                Connecting you with your favorite local food stalls. Order online, 
                skip the line, and pick up your freshly prepared meal in minutes.
              </Text>
            </VStack>
            
            <Stack 
              direction={{ base: 'row', md: 'row' }}
              spacing={4}
              align="center"
            >
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  isExternal
                  _hover={{ textDecoration: 'none' }}
                >
                  <IconButton
                    aria-label={social.label}
                    icon={social.icon}
                    rounded="full"
                    bg="whiteAlpha.200"
                    _hover={{ bg: 'whiteAlpha.300', transform: 'scale(1.1)' }}
                    transition="all 0.3s"
                    size="lg"
                  />
                </Link>
              ))}
            </Stack>
          </Flex>

          <SimpleGrid 
            columns={{ base: 2, md: 4 }} 
            spacing={{ base: 8, md: 12 }}
            mb={16}
          >
            <VStack align="flex-start" spacing={4}>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                Company
              </Text>
              <Button 
                as={RouterLink} 
                to="/aboutus" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                About Us
              </Button>
            </VStack>

            <VStack align="flex-start" spacing={4}>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                Support
              </Text>
              <Button 
                as={RouterLink} 
                to="/helpcenter" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Help Center
              </Button>
              <Button 
                as={RouterLink} 
                to="/contactus" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Contact Us
              </Button>
            </VStack>

            <VStack align="flex-start" spacing={4}>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                How It Works
              </Text>
              <Button 
                as={RouterLink} 
                to="/howitworks" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Workflow
              </Button>
            </VStack>

            <VStack align="flex-start" spacing={4}>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                Legal
              </Text>
              <Button 
                as={RouterLink} 
                to="/termsandconditions" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Terms And Conditions
              </Button>
              <Button 
                as={RouterLink} 
                to="/privacypolicy" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Privacy Policy
              </Button>
              <Button 
                as={RouterLink} 
                to="/refund" 
                variant="link" 
                color="white" 
                fontWeight="normal" 
                fontSize="sm" 
                _hover={{ color: 'whiteAlpha.700', textDecoration: 'none' }}
              >
                Cancellation Policy
              </Button>
            </VStack>
          </SimpleGrid>

          <Box 
            pt={8} 
            borderTopWidth={1} 
            borderColor="whiteAlpha.400"
          >
            <SimpleGrid 
              columns={{ base: 1, md: 2 }} 
              spacing={8}
            >
              <Text 
                fontSize="sm" 
                textAlign={{ base: 'center', md: 'left' }}
              >
                © 2024 FOST. All rights reserved
              </Text>
              <Text 
                fontSize="sm" 
                textAlign={{ base: 'center', md: 'right' }}
              >
                Connecting food lovers with local stalls
              </Text>
            </SimpleGrid>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;