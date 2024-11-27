import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Text, 
  keyframes, 
  usePrefersReducedMotion, 
  useBreakpointValue 
} from '@chakra-ui/react';

const LoadingScreen = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // More sophisticated responsive font sizes
  const titleSize = useBreakpointValue({ base: '4xl', md: '6xl' });
  const subtitleSize = useBreakpointValue({ base: 'lg', md: 'xl' });

  // Enhanced typography animation with more dynamic effects
  const trackKeyframes = keyframes`
    0% { 
      letter-spacing: -0.5em; 
      opacity: 0; 
      transform: scale(0.8);
    }
    40% { 
      opacity: 0.6;
      transform: scale(1.1);
    }
    100% { 
      letter-spacing: normal; 
      opacity: 1;
      transform: scale(1);
    }
  `;

  const trackAnimation = prefersReducedMotion
    ? 'none'
    : `${trackKeyframes} 1.2s cubic-bezier(0.25, 0.1, 0.25, 1) forwards`;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Flex
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="#FC8019"
        alignItems="center"
        justifyContent="center"
        zIndex="9999"
        color="white"
        overflow="hidden"
      >
        <VStack 
          spacing={8} 
          textAlign="center"
          position="relative"
        >
          <Box
            width={['250px', '350px']}
            height={['250px', '350px']}
            borderRadius="full"
            bg="whiteAlpha.300"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow="0 0 50px rgba(255,255,255,0.2)"
            transform="perspective(500px) rotateY(15deg)"
            transition="all 0.7s ease"
            _hover={{
              transform: "perspective(500px) rotateY(-15deg) scale(1.05)",
              boxShadow: "0 0 70px rgba(255,255,255,0.4)"
            }}
          >
            <Text
              fontSize={titleSize}
              fontWeight="bold"
              color="white"
              animation={trackAnimation}
              textShadow="2px 2px 4px rgba(0,0,0,0.3)"
            >
              FOST
            </Text>
          </Box>
          <Text
            color="whiteAlpha.900"
            fontSize={subtitleSize}
            fontWeight="medium"
            animation={trackAnimation}
            animationDelay="0.6s"
            opacity={0}
            animationFillMode="forwards"
            textShadow="1px 1px 2px rgba(0,0,0,0.2)"
          >
            Loading Experience
          </Text>
        </VStack>
      </Flex>
    );
  }

  return <>{children}</>;
};

export default LoadingScreen;