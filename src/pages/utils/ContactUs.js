import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  Flex
} from '@chakra-ui/react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to a backend service
    console.log('Form submitted:', formData);
    
    // Show success toast
    toast({
      title: "Message Sent",
      description: "We'll get back to you soon!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <Box bg="gray.50" minHeight="100vh" py={16}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading 
              as="h1" 
              size="2xl" 
              color="orange.500" 
              mb={4}
            >
              Contact Us
            </Heading>
            <Text 
              color="gray.600" 
              maxW="600px" 
              mx="auto"
            >
              We're here to help! If you have any questions, suggestions, or concerns, 
              please fill out the form below and we'll get back to you as soon as possible.
            </Text>
          </Box>

          <Box 
            bg="white" 
            p={8} 
            borderRadius="xl" 
            boxShadow="md"
          >
            <form onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl id="name" isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    focusBorderColor="orange.500"
                  />
                </FormControl>

                <FormControl id="email" isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    focusBorderColor="orange.500"
                  />
                </FormControl>

                <FormControl id="message" isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Type your message here..."
                    rows={6}
                    focusBorderColor="orange.500"
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="orange"
                  size="lg"
                  width="full"
                >
                  Send Message
                </Button>
              </VStack>
            </form>
          </Box>

          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            justify="space-between" 
            bg="white" 
            p={6} 
            borderRadius="xl" 
            boxShadow="md"
          >
            <Box mb={{ base: 4, md: 0 }}>
              <Text fontWeight="bold" color="gray.700">Customer Support</Text>
              <Text color="gray.600">team@placeus.in</Text>
            </Box>
            {/* <Box>
              <Text fontWeight="bold" color="gray.700">Phone</Text>
              <Text color="gray.600">+1 (555) 123-4567</Text>
            </Box> */}
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
};

export default ContactUs;