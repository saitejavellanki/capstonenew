import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Divider,
  chakra
} from '@chakra-ui/react';

const TermsAndConditions = () => {
  return (
    <Box bg="white" minHeight="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Heading 
            as="h1" 
            size="2xl" 
            textAlign="center" 
            color="orange.500"
          >
            Terms and Conditions
          </Heading>

          <Section title="1. User Agreement">
            <Text>
              By using FOST, you agree to the following terms and conditions. 
              The service is provided for food ordering and pickup at local food stalls.
            </Text>
          </Section>

          <Section title="2. User Eligibility">
            <Text>
              Users must be at least 18 years old or have parental consent to use FOST. 
              Each user is responsible for maintaining the confidentiality of their account.
            </Text>
          </Section>

          <Section title="3. Order Policies">
            <Text>
              - Orders are subject to stall availability and menu items
              - Prices are as displayed at the time of ordering
              - Users must collect orders within 30 minutes of the 'Ready for Pickup' status
              - Cancellations are allowed before order preparation begins
            </Text>
          </Section>

          <Section title="4. Payment Terms">
            <Text>
              - All payments are processed through secure digital methods
              - Prices include applicable taxes
              - Refunds are processed according to individual stall policies
            </Text>
          </Section>

          <Section title="5. QR Code Pickup">
            <Text>
              - QR codes are valid for a single order pickup
              - Users must present the QR code at the designated pickup area
              - Lost or expired QR codes may require re-ordering
            </Text>
          </Section>

          <Section title="6. User Conduct">
            <Text>
              Users agree not to:
              - Use the platform for illegal activities
              - Harass or abuse other users or stall owners
              - Share fraudulent or misleading information
            </Text>
          </Section>

          <Section title="7. Liability Limitations">
            <Text>
              FOST is not responsible for:
              - Food quality or preparation
              - Delays caused by individual stalls
              - Technical issues beyond our control
            </Text>
          </Section>

          <Text 
            textAlign="center" 
            color="gray.500" 
            fontSize="sm" 
            mt={8}
          >
            Last Updated: November 2024
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

const Section = ({ title, children }) => (
  <Box>
    <Heading 
      as="h2" 
      size="lg" 
      color="orange.600" 
      mb={4}
    >
      {title}
    </Heading>
    {children}
    <Divider my={4} borderColor="orange.200" />
  </Box>
);

export default TermsAndConditions;