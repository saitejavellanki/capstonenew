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
  Image,
  Icon
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
import backgroundImage from "../../Assets/WhatsApp Image 2024-11-20 at 10.00.05 PM.jpeg";

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

        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
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
      position="relative"
      h="100vh" 
      overflow="hidden"
    >
      {/* Gradient Overlay Background */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        backgroundImage="linear-gradient(135deg, rgba(58,123,213,0.8) 0%, rgba(58,96,115,0.8) 100%)"
        backgroundSize="cover"
        zIndex="1"
      />

      {/* Background Image with Blur */}
      <Image 
        src={backgroundImage}
        position="absolute"
        top="0"
        left="0"
        w="full"
        h="full"
        objectFit="cover"
        filter="blur(8px)"
        opacity="0.6"
        zIndex="0"
      />

      <Flex 
        position="relative"
        zIndex="2"
        w="full" 
        h="full" 
        justify="center" 
        align="center" 
        p={4}
      >
        <VStack 
          bg="white" 
          w="400px" 
          p={8} 
          spacing={6} 
          borderRadius="2xl" 
          boxShadow="2xl"
        >
          <VStack spacing={2} textAlign="center" w="full">
            <Heading 
              fontSize="3xl" 
              color="blue.600" 
              fontWeight="bold"
            >
              Welcome Back
            </Heading>
            <Text color="gray.500">
              Sign in to continue
            </Text>
          </VStack>

          {loginError && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <VStack w="full" spacing={4}>
            <FormControl>
              <Input 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftElement={<Icon as={MdEmail} color="gray.400" />}
                bg="gray.100"
                border="none"
                h="50px"
                borderRadius="xl"
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <FormControl>
              <Input 
                type="password"
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftElement={<Icon as={MdLock} color="gray.400" />}
                bg="gray.100"
                border="none"
                h="50px"
                borderRadius="xl"
                _placeholder={{ color: "gray.500" }}
              />
            </FormControl>

            <Flex w="full" justifyContent="flex-end">
              <Link 
                color="blue.500" 
                fontWeight="semibold"
                _hover={{ textDecoration: "none", color: "blue.600" }}
                onClick={() => navigate("/reset-password")}
              >
                Forgot Password?
              </Link>
            </Flex>

            <Button
              w="full"
              colorScheme="blue"
              h="50px"
              borderRadius="xl"
              isLoading={isLoading}
              onClick={() => handleSignIn("email")}
            >
              Sign In
            </Button>
          </VStack>

          <Divider />

          <Button
            w="full"
            variant="outline"
            h="50px"
            borderRadius="xl"
            leftIcon={<Icon as={FcGoogle} boxSize={6} />}
            borderColor="gray.300"
            color="gray.700"
            isLoading={isLoading}
            onClick={() => handleSignIn("google")}
          >
            Sign in with Google
          </Button>

          <Text>
            New User?{" "}
            <Link 
              color="blue.500" 
              fontWeight="bold"
              _hover={{ textDecoration: "none", color: "blue.600" }}
              onClick={() => navigate("/register")}
            >
              Create an Account
            </Link>
          </Text>
        </VStack>
      </Flex>
    </Flex>
  );
};

export default Login;