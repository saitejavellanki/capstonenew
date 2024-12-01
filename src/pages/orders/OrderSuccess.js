import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const navigate = useNavigate();

  return (
    <VStack spacing={6} align="center" justify="center" height="100vh">
      <Heading color="green.500">Order Successful!</Heading>
      <Text>Your payment has been processed successfully.</Text>
      <Button 
        colorScheme="green" 
        onClick={() => navigate('/')}
      >
        Continue Shopping
      </Button>
    </VStack>
  );
};

export default OrderSuccess;