import React, { useState } from "react";
import {
  Box,
  Flex,
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
  Container,
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
    <Flex 
      minH={{ base: "100vh", md: "100vh" }} 
      direction={{ base: "column", md: "row" }}
    >
      {/* Left Side - Hero Section */}
      <Box
        display={{ base: "flex", md: "flex" }}
        flex={{ base: "none", md: "1" }}
        bg="orange.500"
        position="relative"
        overflow="hidden"
        minH={{ base: "120px", md: "auto" }}
        py={{ base: 8, md: 0 }}
      >
        <VStack
          w="full"
          h="full"
          justify="center"
          p={{ base: 4, md: 10 }}
          spacing={{ base: 2, md: 6 }}
          color="white"
        >
          <Heading 
            size={{ base: "lg", md: "2xl" }} 
            fontWeight="bold" 
            textAlign="center"
          >
            Welcome Back
          </Heading>
          <Text 
            fontSize={{ base: "sm", md: "xl" }} 
            textAlign="center" 
            maxW="400px"
            display={{ base: "none", md: "block" }}
          >
            Your trusted marketplace for quality products and services
          </Text>
        </VStack>
      </Box>

      {/* Right Side - Login Form */}
      <Flex
        flex="1"
        bg="white"
        justify="center"
        align="center"
        p={{ base: 4, sm: 6, md: 8, lg: 12 }}
      >
        <Container maxW={{ base: "100%", sm: "400px" }} px={{ base: 4, sm: 0 }}>
          <VStack spacing={{ base: 4, md: 6 }} w="full">
            <VStack spacing={2} align="flex-start" w="full">
              <Heading 
                fontSize={{ base: "xl", md: "2xl" }} 
                color="gray.800"
              >
                Sign In
              </Heading>
              <Text 
                color="gray.600" 
                fontSize={{ base: "sm", md: "md" }}
              >
                Don't have an account?{" "}
                <Link
                  color="orange.500"
                  fontWeight="semibold"
                  _hover={{ textDecoration: "none", color: "orange.600" }}
                  onClick={() => navigate("/register")}
                >
                  Join Now
                </Link>
              </Text>
            </VStack>

            {loginError && (
              <Alert 
                status="error" 
                borderRadius="md"
                fontSize={{ base: "sm", md: "md" }}
              >
                <AlertIcon />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <VStack spacing={4} w="full">
              <FormControl>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdEmail} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    borderRadius="md"
                    _focus={{
                      borderColor: "orange.500",
                      boxShadow: "0 0 0 1px orange.500",
                    }}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <InputGroup size={{ base: "md", md: "lg" }}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={MdLock} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    borderRadius="md"
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
                  fontSize={{ base: "sm", md: "sm" }}
                  _hover={{ textDecoration: "none", color: "orange.600" }}
                  onClick={() => navigate("/reset-password")}
                >
                  Forgot Password?
                </Link>
              </Flex>

              <Button
                w="full"
                size={{ base: "md", md: "lg" }}
                colorScheme="orange"
                isLoading={isLoading}
                onClick={() => handleSignIn("email")}
                borderRadius="md"
              >
                Sign In
              </Button>

              <Flex align="center" w="full" my={{ base: 2, md: 2 }}>
                <Divider borderColor="gray.200" />
                <Text 
                  px={4} 
                  color="gray.500" 
                  fontSize={{ base: "sm", md: "sm" }}
                >
                  or
                </Text>
                <Divider borderColor="gray.200" />
              </Flex>

              <Button
                w="full"
                size={{ base: "md", md: "lg" }}
                variant="outline"
                leftIcon={<Icon as={FcGoogle} boxSize={5} />}
                onClick={() => handleSignIn("google")}
                isLoading={isLoading}
                borderRadius="md"
                borderColor="gray.200"
                _hover={{ bg: "gray.50" }}
              >
                Continue with Google
              </Button>
            </VStack>

            <Text 
              fontSize={{ base: "xs", md: "sm" }} 
              color="gray.500" 
              textAlign="center"
              mt={{ base: 2, md: 4 }}
            >
              By signing in, you agree to our{" "}
              <Link
                color="orange.500"
                onClick={() => navigate("/termsandconditions")}
                _hover={{ textDecoration: "none", color: "orange.600" }}
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                color="orange.500"
                onClick={() => navigate("/privacypolicy")}
                _hover={{ textDecoration: "none", color: "orange.600" }}
              >
                Privacy Policy
              </Link>
            </Text>
          </VStack>
        </Container>
      </Flex>
    </Flex>
  );
};

export default Login;