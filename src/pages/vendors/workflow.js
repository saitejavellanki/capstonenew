import React, { useState, useEffect } from 'react';
import {
  Container,
  VStack,
  HStack,
  Heading,
  Box,
  Text,
  Flex,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Divider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Collapse,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useToast,
  SimpleGrid
} from '@chakra-ui/react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { 
  AiOutlineClockCircle, 
  AiOutlineCheckCircle, 
  AiOutlineSearch,
  AiOutlinePlayCircle,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineStop,
  AiOutlineFire
} from 'react-icons/ai';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// Reuse existing calculation functions
const calculatePrepTime = (items) => {
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  return 2 + totalItems;
};
const getCategoryColor = (category) => {
  switch (category) {
    case 'express': return 'green';
    case 'standard': return 'blue';
    case 'complex': return 'orange';
    default: return 'gray';
  }
};

const calculateOrderPriority = (order) => {
  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const waitTime = (new Date() - order.createdAt) / (1000 * 60);
  
  let category;
  if (totalItems <= 2) {
    category = 'express';
  } else if (totalItems <= 5) {
    category = 'standard';
  } else {
    category = 'complex';
  }

  let priorityScore = totalItems;
  if (waitTime > 15) {
    priorityScore -= (waitTime / 15);
  }

  return {
    category,
    totalItems,
    priorityScore,
    estimatedPrepTime: calculatePrepTime(order.items),
    waitTime: Math.round(waitTime)
  };
};

const OrderCard = ({ order, onUpdateStatus, expandedOrders, toggleOrderExpansion, onScanQR, showActions = true }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const priority = calculateOrderPriority(order);

 

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box 
      borderWidth={1} 
      borderRadius="lg" 
      p={4} 
      bg={bgColor} 
      borderColor={getCategoryColor(priority.category)}
      borderLeftWidth={4}
      shadow="md"
      mb={4}
      width="100%"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <VStack align="start" spacing={2}>
          <HStack>
            <Text fontWeight="bold">Order #{order.id.slice(-6)}</Text>
            <Text color="gray.500" fontSize="sm">
              {order.createdAt.toLocaleString()}
            </Text>
          </HStack>
          <HStack>
            <Badge colorScheme={getCategoryColor(priority.category)}>
              {priority.category.toUpperCase()}
            </Badge>
            <Badge colorScheme="purple">
              {priority.totalItems} {priority.totalItems === 1 ? 'item' : 'items'}
            </Badge>
            <Badge colorScheme="yellow">
              ~{priority.estimatedPrepTime} min
            </Badge>
            {priority.waitTime > 10 && order.status !== 'completed' && (
              <Badge colorScheme="red">
                <HStack spacing={1}>
                  <AiOutlineFire />
                  <Text>{priority.waitTime} min wait</Text>
                </HStack>
              </Badge>
            )}
          </HStack>
        </VStack>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => toggleOrderExpansion(order.id)}
        >
          {expandedOrders[order.id] ? <AiOutlineUp /> : <AiOutlineDown />}
        </Button>
      </Flex>

      <Collapse in={expandedOrders[order.id]} animateOpacity>
        <Box mt={4}>
          <Divider mb={4} />
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Item</Th>
                <Th isNumeric>Quantity</Th>
                <Th isNumeric>Price</Th>
              </Tr>
            </Thead>
            <Tbody>
              {order.items?.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.name}</Td>
                  <Td isNumeric>{item.quantity}</Td>
                  <Td isNumeric>${item.price?.toFixed(2)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          {showActions && (
            <HStack mt={4} spacing={2} justifyContent="flex-end">
              {order.status === 'pending' && (
                <Button 
                  size="sm" 
                  colorScheme={getCategoryColor(priority.category)}
                  onClick={() => onUpdateStatus(order.id, 'processing')}
                  leftIcon={<AiOutlinePlayCircle />}
                >
                  Start Processing
                </Button>
              )}
              {order.status === 'processing' && (
                <>
                  <Button 
                    size="sm" 
                    colorScheme="green"
                    onClick={() => onUpdateStatus(order.id, 'completed')}
                    leftIcon={<AiOutlineCheckCircle />}
                  >
                    Mark as Ready
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="red"
                    variant="outline"
                    onClick={() => onUpdateStatus(order.id, 'cancelled')}
                    leftIcon={<AiOutlineStop />}
                  >
                    Cancel
                  </Button>
                </>
              )}
              {order.status === 'completed' && (
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => onScanQR(order)}
                  leftIcon={<AiOutlineCheckCircle />}
                >
                  Scan QR for Pickup
                </Button>
              )}
            </HStack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

const KanbanColumn = ({ title, orders, onUpdateStatus, expandedOrders, toggleOrderExpansion, onScanQR, icon, colorScheme }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const [expandedCategories, setExpandedCategories] = useState({
    express: false,
    standard: false,
    complex: false
  });
  
  const groupedOrders = orders.reduce((acc, order) => {
    const priority = calculateOrderPriority(order);
    if (!acc[priority.category]) {
      acc[priority.category] = [];
    }
    acc[priority.category].push(order);
    return acc;
  }, {});

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <Box 
      width="100%"
      height="calc(100vh - 200px)"
      overflowY="auto"
      p={4}
      bg={bgColor}
      borderRadius="lg"
    >
      <Heading size="md" mb={4}>
        <HStack>
          {icon}
          <Text>{title}</Text>
          <Badge colorScheme={colorScheme}>
            {orders.length}
          </Badge>
        </HStack>
      </Heading>

      {['express', 'standard', 'complex'].map(category => (
        groupedOrders[category]?.length > 0 && (
          <Box key={category} mb={6}>
            <HStack 
              spacing={2} 
              mb={2}
              cursor="pointer"
              onClick={() => toggleCategory(category)}
              align="center"
            >
              <Button
                size="sm"
                variant="ghost"
                p={0}
                minW="auto"
                h="auto"
              >
                {expandedCategories[category] ? <AiOutlineUp /> : <AiOutlineDown />}
              </Button>
              <Heading 
                size="sm" 
                color={`${getCategoryColor(category)}.500`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)} Orders ({groupedOrders[category].length})
              </Heading>
            </HStack>
            
            <Collapse in={expandedCategories[category]} animateOpacity>
              <VStack spacing={4} align="stretch">
                {groupedOrders[category].map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={onUpdateStatus}
                    expandedOrders={expandedOrders}
                    toggleOrderExpansion={toggleOrderExpansion}
                    onScanQR={onScanQR}
                  />
                ))}
              </VStack>
            </Collapse>
          </Box>
        )
      ))}
    </Box>
  );
};

const QRScannerModal = ({ isOpen, onClose, order, onScanComplete }) => {
  const handleQRScan = async (result) => {
    try {
      const scannedValue = result[0]?.rawValue;
      const expectedValue = `order-pickup:${order.id}`;
      
      if (scannedValue === expectedValue) {
        await onScanComplete(order.id);
        onClose();
      }
    } catch (error) {
      console.error('QR scan error:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Scan QR Code for Order #{order?.id.slice(-6)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Scanner
            onScan={handleQRScan}
            onError={(error) => console.error(error?.message)}
          />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const VendorOrderDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [qrScannerModal, setQRScannerModal] = useState({ isOpen: false, order: null });
  const toast = useToast();
  const firestore = getFirestore();

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef, where('shopId', '==', user.shopId));
        const snapshot = await getDocs(q);
        
        const ordersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })).sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(ordersList);
        setFilteredOrders(ordersList);
      } catch (error) {
        console.error('Failed to fetch orders', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch orders',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [firestore, toast]);

  useEffect(() => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(order => 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(order => 
        calculateOrderPriority(order).category === categoryFilter
      );
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, categoryFilter]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        updatedAt: new Date()
      };

      if (newStatus === 'completed') {
        updateData.pickupCode = Math.random().toString(36).substr(2, 6).toUpperCase();
        
      }

      await updateDoc(doc(firestore, 'orders', orderId), updateData);
      
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, ...updateData } 
          : order
      ));

      toast({
        title: 'Status Updated',
        description: `Order status updated to ${newStatus}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to update order status', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleScanQR = (order) => {
    setQRScannerModal({ isOpen: true, order });
  };

  const handleQRScanComplete = async (orderId) => {
    try {
      await updateDoc(doc(firestore, 'orders', orderId), {
        status: 'picked_up',
        pickedUpAt: new Date()
      });

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'picked_up', pickedUpAt: new Date() } 
          : order
      ));

      toast({
        title: 'Order Picked Up',
        description: 'Order has been successfully picked up',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Failed to complete pickup', error);
      toast({
        title: 'Error',
        description: 'Failed to complete pickup',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack spacing={4}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <AiOutlineSearch />
            </InputLeftElement>
            <Input 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            width="200px"
          >
            <option value="all">All Categories</option>
            <option value="express">Express</option>
            <option value="standard">Standard</option>
            <option value="complex">Complex</option>
          </Select>
        </HStack>

        <SimpleGrid columns={[1, 1, 3]} spacing={4} width="100%">
          <KanbanColumn
            title="Pending Orders"
            orders={filteredOrders.filter(order => order.status === 'pending')}
            onUpdateStatus={updateOrderStatus}
            expandedOrders={expandedOrders}
            toggleOrderExpansion={toggleOrderExpansion}
            onScanQR={handleScanQR}
            icon={<AiOutlineClockCircle />}
            colorScheme="yellow"
          />

          <KanbanColumn
            title="Processing"
            orders={filteredOrders.filter(order => order.status === 'processing')}
            onUpdateStatus={updateOrderStatus}
            expandedOrders={expandedOrders}
            toggleOrderExpansion={toggleOrderExpansion}
            onScanQR={handleScanQR}
            icon={<AiOutlinePlayCircle />}
            colorScheme="blue"
          />

          <KanbanColumn
            title="Ready for Pickup"
            orders={filteredOrders.filter(order => order.status === 'completed')}
            onUpdateStatus={updateOrderStatus}
            expandedOrders={expandedOrders}
            toggleOrderExpansion={toggleOrderExpansion}
            onScanQR={handleScanQR}
            icon={<AiOutlineCheckCircle />}
            colorScheme="green"
          />
        </SimpleGrid>

        <QRScannerModal
          isOpen={qrScannerModal.isOpen}
          onClose={() => setQRScannerModal({ isOpen: false, order: null })}
          order={qrScannerModal.order}
          onScanComplete={handleQRScanComplete}
        />
      </VStack>
    </Container>
  );
};

export default VendorOrderDashboard;