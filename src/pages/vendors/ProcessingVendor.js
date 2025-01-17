import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  HStack,
  IconButton,
  useColorModeValue,
  Badge,
  useToast
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const ProcessingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchProcessingOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const firestore = getFirestore();
      const ordersRef = collection(firestore, 'orders');
      const q = query(
        ordersRef,
        where('shopId', '==', user.shopId),
        where('status', '==', 'processing')
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error fetching orders',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchProcessingOrders();
    const interval = setInterval(fetchProcessingOrders, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      const firestore = getFirestore();
      const orderRef = doc(firestore, 'orders', orderId);
      
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );

      toast({
        title: 'Order updated',
        description: `Order #${orderId.slice(-6)} has been ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error updating order',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Box
        bg={bgColor}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        boxShadow="sm"
      >
        <Box p={6}>
          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="lg">Process</Heading>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  borderRadius="md"
                />
              </InputGroup>
              
            </HStack>
          </Flex>

          <Box overflowX="auto">
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Quantity</Th>
                  <Th>Price</Th>
                  <Th>Time/Date</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                    <Td>#{order.id.slice(-6)}</Td>
                    <Td>{order.customer?.name || 'N/A'}</Td>
                    <Td>
                      {order.items?.map(item => item.name).join(', ')}
                    </Td>
                    <Td>
                      {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                    </Td>
                    <Td>${order.total?.toFixed(2) || '0.00'}</Td>
                    <Td>
                      {new Date(order.createdAt).toLocaleString()}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme="blue"
                        py={1}
                        px={2}
                        borderRadius="md"
                      >
                        Processing
                      </Badge>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          colorScheme="green"
                          aria-label="Complete order"
                          icon={<CheckIcon />}
                          size="sm"
                          isLoading={isUpdating}
                          onClick={() => handleStatusUpdate(order.id, 'completed')}
                        />
                        <IconButton
                          colorScheme="red"
                          aria-label="Cancel order"
                          icon={<CloseIcon />}
                          size="sm"
                          isLoading={isUpdating}
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ProcessingOrders;