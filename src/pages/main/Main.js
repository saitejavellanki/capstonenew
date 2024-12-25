import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Image,
  Heading,
  Spinner,
  useToast,
  Grid,
  GridItem,
  Container,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  HStack,
  Icon,
  Select,
  Button,
  useColorModeValue
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../../Components/firebase/Firebase';
import { FaSearch, FaStar, FaClock, FaFilter, FaLeaf, FaTag, FaAward } from "react-icons/fa";
import Footer from "../../Components/footer/Footer";

const ShopCard = ({ shop }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const closedCardBg = useColorModeValue("white", "gray.800");

  const {
    name,
    imageUrl,
    description,
    rating = 4.2,
    deliveryTime = "30-40",
    promoted = false,
    cuisines = ["North Indian", "Chinese"],
    priceForTwo = "₹300",
    discount = "50% OFF up to ₹100",
    isOpen
  } = shop;

  if (!isOpen) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="xl"
        overflow="hidden"
        bg={closedCardBg}
        position="relative"
        opacity={0.7}
        cursor="not-allowed"
        boxShadow="lg"
      >
        <Box position="relative">
          <Image
            src={imageUrl}
            alt={name}
            h="200px"
            w="100%"
            objectFit="cover"
            filter="grayscale(100%)"
          />
          <Flex
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.700"
            alignItems="center"
            justifyContent="center"
          >
            <Text
              color="white"
              fontSize="xl"
              fontWeight="bold"
              px={6}
              py={3}
              bg="blackAlpha.800"
              borderRadius="md"
            >
              Currently Closed
            </Text>
          </Flex>
        </Box>
        <Box p={4}>
          <Text fontSize="xl" fontWeight="semibold" color="gray.400">
            {name}
          </Text>
          <Text color="gray.400" mt={1} fontSize="sm">
            {description}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Link to={`/shop/${shop.id}`}>
      <Box
        borderWidth="1px"
        borderRadius="xl"
        overflow="hidden"
        bg={cardBg}
        transition="all 0.3s"
        _hover={{
          transform: "translateY(-4px)",
          boxShadow: "2xl",
        }}
        position="relative"
      >
        <Box position="relative">
          <Image
            src={imageUrl}
            alt={name}
            h="200px"
            w="100%"
            objectFit="cover"
          />
          {promoted && (
            <Badge
              position="absolute"
              top={4}
              left={4}
              colorScheme="yellow"
              variant="solid"
              px={2}
              py={1}
              borderRadius="sm"
            >
              <Flex align="center">
                <Icon as={FaAward} mr={1} />
                Featured
              </Flex>
            </Badge>
          )}
          {discount && (
            <Badge
              position="absolute"
              bottom={4}
              left={4}
              colorScheme="green"
              variant="solid"
              px={2}
              py={1}
              borderRadius="sm"
            >
              {discount}
            </Badge>
          )}
        </Box>

        <Box p={4}>
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="xl" fontWeight="bold">
              {name}
            </Text>
            <Badge
              colorScheme={rating >= 4 ? "green" : rating >= 3 ? "yellow" : "red"}
              px={2}
              py={1}
              borderRadius="lg"
              fontSize="sm"
            >
              <Flex align="center">
                <Icon as={FaStar} mr={1} />
                {rating}
              </Flex>
            </Badge>
          </Flex>

          <HStack spacing={2} color={textColor} fontSize="sm" mb={2}>
            {cuisines.map((cuisine, index) => (
              <React.Fragment key={cuisine}>
                <Text>{cuisine}</Text>
                {index < cuisines.length - 1 && <Text>•</Text>}
              </React.Fragment>
            ))}
          </HStack>

          <HStack spacing={4} color={textColor} fontSize="sm">
            <Flex align="center">
              <Icon as={FaTag} mr={1} color="orange.500" />
              <Text>{priceForTwo} for two</Text>
            </Flex>
            <Flex align="center">
              <Icon as={FaClock} mr={1} color="purple.500" />
              <Text>{deliveryTime} mins</Text>
            </Flex>
          </HStack>
        </Box>
      </Box>
    </Link>
  );
};

const Main = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headingColor = useColorModeValue("gray.700", "white");
  const inputBgColor = useColorModeValue("white", "gray.800");

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const firestore = getFirestore(app);
  const toast = useToast();

  const fetchShops = async () => {
    try {
      const shopsRef = collection(firestore, 'shops');
      const snapshot = await getDocs(shopsRef);
      const shopsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setShops(shopsList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setError('Error fetching shops. Please try again later.');
      setLoading(false);
      toast({
        title: 'Error',
        description: 'Could not fetch shops',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    fetchShops();
  }, [firestore, toast]);

  const filteredShops = shops
    .filter(shop => 
      shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.cuisines?.some(cuisine => 
        cuisine.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "deliveryTime":
          return parseInt(a.deliveryTime) - parseInt(b.deliveryTime);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <Flex 
        justifyContent="center" 
        alignItems="center" 
        height="100vh" 
        bg={bgColor}
      >
        <Spinner 
          size="xl" 
          color="blue.500" 
          thickness="4px" 
          speed="0.75s"
        />
      </Flex>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" centerContent>
        <Box 
          p={6} 
          textAlign="center" 
          bg="red.50" 
          borderRadius="lg"
          mt={10}
        >
          <Text color="red.500" fontWeight="bold">
            {error}
          </Text>
        </Box>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minHeight="100vh">
      <Container maxW="container.xl" py={8}>
        <Box mb={8}>
          <Heading 
            textAlign="center" 
            color={headingColor}
            size="2xl"
            mb={8}
          >
            Discover Our Shops
          </Heading>
          
          <Flex 
            direction={{ base: "column", md: "row" }} 
            gap={4}
            mb={6}
          >
            <InputGroup size="lg" flex={{ base: "1", md: "2" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FaSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search for restaurants or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={inputBgColor}
                borderRadius="lg"
              />
            </InputGroup>
            
            <Select
              size="lg"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              bg={inputBgColor}
              borderRadius="lg"
              flex="1"
            >
              <option value="rating">Sort by Rating</option>
              <option value="deliveryTime">Sort by Delivery Time</option>
            </Select>
          </Flex>
        </Box>

        {filteredShops.length === 0 ? (
          <Flex 
            justifyContent="center" 
            alignItems="center" 
            height="50vh"
            direction="column"
            gap={4}
          >
            <Text 
              textAlign="center" 
              color="gray.500" 
              fontSize="xl"
            >
              No restaurants found matching your search.
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => {
                setSearchTerm("");
                setSortBy("rating");
              }}
            >
              Clear Filters
            </Button>
          </Flex>
        ) : (
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)"
            }}
            gap={6}
          >
            {filteredShops.map((shop) => (
              <GridItem key={shop.id}>
                <ShopCard shop={shop} />
              </GridItem>
            ))}
          </Grid>
        )}
      </Container>
      <Footer />
    </Box>
  );
};

export default Main;