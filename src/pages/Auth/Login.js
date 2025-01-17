import React, { useState } from "react";
import {
  Box,
  Flex,
  Stack,
  VStack,
  Heading,
  Input,
  Button,
  Text,
  Link,
  useToast,
  FormControl,
  Divider,
  Alert,
  AlertIcon,
  AlertDescription,
  Icon,
  InputGroup,
  InputLeftElement,
  HStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { MdEmail, MdLock } from "react-icons/md";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../../Components/firebase/Firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const toast = useToast();
  const navigate = useNavigate();

  const handleSignIn = async (signInMethod) => {
    setIsLoading(true);
    setLoginError("");

    try {
      let userCredential;
      if (signInMethod === "email") {
        if (!email || !password) {
          setLoginError("Please enter both email and password");
          setIsLoading(false);
          return;
        }

        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        const provider = new GoogleAuthProvider();
        userCredential = await signInWithPopup(auth, provider);
      }

      const userDocRef = doc(firestore, "users", userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      const userData = userDoc.exists()
        ? userDoc.data()
        : { email: userCredential.user.email, role: "customer" };

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: userData.role,
          shopId: userData.shopId || null,
        })
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      switch (userData.role) {
        case "admin":
          navigate("/admin/shops");
          break;
        case "vendor":
          navigate("/vendor/items");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.code === "auth/invalid-credential"
          ? "Invalid email or password. Please try again."
          : "Login failed. Please try again.";

      setLoginError(errorMessage);
      toast({
        title: "Login Error",
        description: errorMessage,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="100vh" direction={{ base: "column", md: "row" }}>
      {/* Left Side - Hero Section */}
      <Box
        display={{ base: "none", md: "flex" }}
        flex="1"
        bg="orange.500"
      >
        <VStack
          w="full"
          h="full"
          justify="center"
          p={10}
          spacing={6}
          color="white"
        >
          <Heading size="2xl" fontWeight="bold" textAlign="center">
            Welcome to Our Marketplace
          </Heading>
          <Text fontSize="xl" textAlign="center" maxW="500px">
            Join thousands of successful entrepreneurs and customers in our thriving marketplace
          </Text>
          
          <Stack spacing={6} mt={4}>
            <HStack spacing={4} justify="center">
              <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                <Text fontWeight="bold">100K+</Text>
                <Text fontSize="sm">Active Users</Text>
              </Box>
              <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                <Text fontWeight="bold">50K+</Text>
                <Text fontSize="sm">Products</Text>
              </Box>
              <Box p={4} bg="whiteAlpha.200" borderRadius="lg">
                <Text fontWeight="bold">95%</Text>
                <Text fontSize="sm">Satisfaction</Text>
              </Box>
            </HStack>
          </Stack>
        </VStack>
      </Box>

      {/* Right Side - Login Form */}
      <Flex
        flex="1"
        bg="white"
        justify="center"
        align="center"
        p={{ base: 4, md: 6, lg: 8 }}
      >
        <VStack
          w="full"
          maxW="440px"
          spacing={4}
        >
          <VStack spacing={1} align="flex-start" w="full">
            <Heading fontSize="3xl" color="gray.800">
              Sign In
            </Heading>
            <Text color="gray.600">
              Don't have an account?{" "}
              <Link
                color="orange.500"
                fontWeight="semibold"
                _hover={{ color: "orange.600" }}
                onClick={() => navigate("/register")}
              >
                Join Now
              </Link>
            </Text>
          </VStack>

          {loginError && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <VStack spacing={3} w="full" mt={2}>
            <FormControl>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdEmail} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <InputGroup size="lg">
                <InputLeftElement pointerEvents="none">
                  <Icon as={MdLock} color="gray.400" />
                </InputLeftElement>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  borderColor="gray.200"
                  _hover={{ borderColor: "orange.400" }}
                  _focus={{
                    borderColor: "orange.500",
                    boxShadow: "0 0 0 1px orange.500",
                  }}
                />
              </InputGroup>
            </FormControl>

            <Flex w="full" justify="flex-end">
              <Link
                color="orange.500"
                fontSize="sm"
                fontWeight="semibold"
                _hover={{ color: "orange.600" }}
                onClick={() => navigate("/reset-password")}
              >
                Forgot Password?
              </Link>
            </Flex>

            <Button
              w="full"
              size="lg"
              colorScheme="orange"
              isLoading={isLoading}
              onClick={() => handleSignIn("email")}
              _hover={{ bg: "orange.600" }}
            >
              Continue
            </Button>

            <HStack w="full" my={1}>
              <Divider />
              <Text fontSize="sm" color="gray.500" whiteSpace="nowrap">
                OR
              </Text>
              <Divider />
            </HStack>

            <Button
              w="full"
              size="lg"
              variant="outline"
              leftIcon={<Icon as={FcGoogle} boxSize={5} />}
              borderColor="gray.200"
              _hover={{ bg: "gray.50" }}
              onClick={() => handleSignIn("google")}
              isLoading={isLoading}
            >
              Continue with Google
            </Button>
          </VStack>

          <Text fontSize="sm" color="gray.500" textAlign="center" mt={2}>
            By joining, you agree to our{" "}
            <Link color="orange.500">Terms of Service</Link> and{" "}
            <Link color="orange.500">Privacy Policy</Link>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Login;