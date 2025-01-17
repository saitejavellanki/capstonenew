import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Heading,
  Select,
  HStack,
  VStack,
  Text,
  Progress,
  Badge,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFirestore, collection, query, getDocs } from 'firebase/firestore';

const KPIDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [timeFrame, setTimeFrame] = useState('today');
  const [loading, setLoading] = useState(true);
  const firestore = getFirestore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.shopId) {
          throw new Error('Shop ID not found');
        }

        const ordersRef = collection(firestore, 'orders');
        const q = query(ordersRef);
        const snapshot = await getDocs(q);

        const fetchedOrders = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date(doc.data().createdAt)
          }))
          .filter(order => order.shopId === user.shopId);

        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getFilteredOrders = () => {
    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch(timeFrame) {
        case 'today':
          return orderDate >= todayStart;
        case 'week':
          return orderDate >= new Date(now.setDate(now.getDate() - 7));
        case 'month':
          return orderDate >= new Date(now.setMonth(now.getMonth() - 1));
        default:
          return true;
      }
    });
  };

  const calculateKPIs = () => {
    const filteredOrders = getFilteredOrders();
    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'completed').length;
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || order.totalAmount || 0), 0);
    const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

    const avgPrepTime = filteredOrders.reduce((sum, order) => {
      if (order.status === 'completed' && order.pickedUpAt) {
        return sum + ((new Date(order.pickedUpAt) - new Date(order.createdAt)) / (1000 * 60));
      }
      return sum;
    }, 0) / completedOrders || 0;

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      avgOrderValue,
      avgPrepTime,
      completionRate: totalOrders ? (completedOrders / totalOrders) * 100 : 0
    };
  };

  const generateChartData = () => {
    const filteredOrders = getFilteredOrders();
    const chartData = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, orders: 0, revenue: 0 };
      }
      acc[date].orders++;
      acc[date].revenue += order.total || order.totalAmount || 0;
      return acc;
    }, {});

    return Object.values(chartData);
  };

  if (loading) {
    return (
      <Center h="400px">
        <Spinner size="xl" />
      </Center>
    );
  }

  const kpis = calculateKPIs();
  const lineChartData = generateChartData();

  return (
    <Container maxW="container.xl" py={8}>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Performance Dashboard</Heading>
        <Select
          width="200px"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </Select>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{kpis.totalOrders}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                23.36%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>${kpis.totalRevenue.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="increase" />
                28.14%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Average Order Value</StatLabel>
              <StatNumber>${kpis.avgOrderValue.toFixed(2)}</StatNumber>
              <StatHelpText>
                <StatArrow type="decrease" />
                4.05%
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Order Completion Rate</Heading>
              <Box>
                <Text mb={2}>{kpis.completionRate.toFixed(1)}%</Text>
                <Progress
                  value={kpis.completionRate}
                  colorScheme={kpis.completionRate > 80 ? 'green' : 'orange'}
                  borderRadius="full"
                />
              </Box>
              <HStack justify="space-between">
                <Badge colorScheme="green">
                  Completed: {kpis.completedOrders}
                </Badge>
                <Badge colorScheme="blue">
                  Total: {kpis.totalOrders}
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <Heading size="md">Average Preparation Time</Heading>
              <Box>
                <Text fontSize="2xl">{Math.round(kpis.avgPrepTime)} minutes</Text>
                <Text color="gray.500" fontSize="sm">
                  Target: 15 minutes
                </Text>
                <Progress
                  value={100 - ((kpis.avgPrepTime - 15) * 5)}
                  colorScheme={kpis.avgPrepTime <= 15 ? 'green' : 'red'}
                  borderRadius="full"
                  mt={2}
                />
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Card gridColumn={{ lg: "span 2" }}>
          <CardBody>
            <Heading size="md" mb={4}>Order Trends</Heading>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3182ce" name="Orders" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#38a169" name="Revenue" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default KPIDashboard;