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
  useToast,
  Text,
  Badge
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, ExternalLinkIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchPendingOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const firestore = getFirestore();
      const ordersRef = collection(firestore, 'orders');
      const q = query(
        ordersRef,
        where('shopId', '==', user.shopId),
        where('status', '==', 'pending')
      );
      
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);

      if (ordersData.length > previousOrderCount) {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(e => console.log('Audio play failed:', e));
        
        toast({
          title: 'New Orders!',
          description: `You have Rs.{ordersData.length - previousOrderCount} new order(s)`,
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      }
      
      setPreviousOrderCount(ordersData.length);
      
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
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const event = new CustomEvent('newPendingOrder', {
      detail: { orderCount: orders.length }
    });
    window.dispatchEvent(event);
  }, [orders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setIsUpdating(true);
      const firestore = getFirestore();
      const orderRef = doc(firestore, 'orders', orderId);
      
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        processedAt: newStatus === 'processing' ? new Date().toISOString() : null
      });

      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );

      toast({
        title: 'Order updated',
        description: `Order #${orderId.slice(-6)} has been moved to ${newStatus}`,
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

  const calculateTotalItems = (items) => {
    return items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
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
            <Box>
              <Heading size="lg">Pending Orders</Heading>
              <Text color="gray.600" mt={1}>
                {orders.length} order{orders.length !== 1 ? 's' : ''} waiting
              </Text>
            </Box>
            <HStack spacing={4}>
              <InputGroup maxW="300px">
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search orders"
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
                  <Th>Order ID</Th>
                  <Th>Customer</Th>
                  <Th>Items</Th>
                  <Th>Quantity</Th>
                  <Th>Total Price</Th>
                  <Th>Order Time</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.length === 0 ? (
                  <Tr>
                    <Td colSpan={8} textAlign="center" py={8}>
                      <Text color="gray.500">No pending orders found</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredOrders.map((order) => (
                    <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
                      <Td>
                        <Text fontWeight="medium">#{order.id.slice(-6)}</Text>
                      </Td>
                      <Td>
                        <Text>{order.customer?.name || 'N/A'}</Text>
                        {order.customer?.phone && (
                          <Text fontSize="sm" color="gray.500">
                            {order.customer.phone}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text noOfLines={2}>
                          {order.items?.map(item => item.name).join(', ')}
                        </Text>
                      </Td>
                      <Td>
                        {calculateTotalItems(order.items)}
                      </Td>
                      <Td>
                        <Text fontWeight="medium">
                          Rs.{order.total?.toFixed(2) || '0.00'}
                        </Text>
                      </Td>
                      <Td>
                        <Text>{formatDate(order.createdAt)}</Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme="yellow"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          Pending
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            colorScheme="green"
                            aria-label="Accept order"
                            icon={<CheckIcon />}
                            size="sm"
                            isLoading={isUpdating}
                            onClick={() => handleStatusUpdate(order.id, 'processing')}
                          />
                          <IconButton
                            colorScheme="red"
                            aria-label="Reject order"
                            icon={<CloseIcon />}
                            size="sm"
                            isLoading={isUpdating}
                            onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default PendingOrders;