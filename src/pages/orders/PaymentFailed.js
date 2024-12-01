import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={6} align="center" justify="center" height="100vh">
      <Heading color="red.500">Payment Failed</Heading>
      <Text>We couldn't process your payment. Please try again.</Text>
      <Button 
        colorScheme="red" 
        onClick={() => navigate('/cart')}
      >
        Back to Cart
      </Button>
    </VStack>
  );
};

export default PaymentFailed;