import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Image,
  keyframes,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import sai from '../../Assets/Fos_t-removebg-preview.png';

const LoadingScreen = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Keep existing animations
  const slideUpKeyframes = keyframes`
    0% { 
      transform: translateY(30px) scale(0.95);
      opacity: 0;
      filter: blur(5px);
    }
    50% {
      filter: blur(2px);
    }
    100% { 
      transform: translateY(0) scale(1);
      opacity: 1;
      filter: blur(0);
    }
  `;

  const floatKeyframes = keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  `;

  const dotKeyframes = keyframes`
    0% { transform: scale(0.8) translateY(0); opacity: 0.3; }
    40% { transform: scale(1.3) translateY(-12px); opacity: 1; }
    100% { transform: scale(0.8) translateY(0); opacity: 0.3; }
  `;

  const pulseKeyframes = keyframes`
    0% { 
      transform: scale(1); 
      box-shadow: 0 0 0 0 rgba(252, 128, 25, 0.4);
    }
    70% { 
      transform: scale(1.05); 
      box-shadow: 0 0 0 15px rgba(252, 128, 25, 0);
    }
    100% { 
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(252, 128, 25, 0);
    }
  `;

  const shimmerKeyframes = keyframes`
    0% { transform: translateX(-150%) rotate(-45deg); }
    100% { transform: translateX(150%) rotate(-45deg); }
  `;

  // Add fade-in animation for tagline
  const fadeInKeyframes = keyframes`
    0% { 
      opacity: 0;
      transform: translateY(20px);
      filter: blur(5px);
    }
    50% {
      opacity: 0.5;
      filter: blur(2px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }
  `;

  const animations = {
    slideUp: prefersReducedMotion
      ? undefined
      : `${slideUpKeyframes} 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
    dot: prefersReducedMotion
      ? undefined
      : `${dotKeyframes} 1.4s infinite`,
    pulse: prefersReducedMotion
      ? undefined
      : `${pulseKeyframes} 2.5s infinite`,
    float: prefersReducedMotion
      ? undefined
      : `${floatKeyframes} 3s ease-in-out infinite`,
    fadeIn: prefersReducedMotion
      ? undefined
      : `${fadeInKeyframes} 0.8s ease-out forwards`
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isLoading) return children;

  return (
    <Flex
      position="fixed"
      inset="0"
      bg="linear-gradient(135deg, #FC8019 0%, #fd9642 100%)"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
      flexDirection="column"
      gap={8}
      overflow="hidden"
    >
      {/* Background Pattern */}
      <Box
        position="absolute"
        inset="0"
        opacity="0.1"
        backgroundImage={`
          radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px),
          radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)
        `}
        backgroundSize="30px 30px, 90px 90px"
        backgroundPosition="0 0, 15px 15px"
        pointerEvents="none"
      />

      {/* Logo Container */}
      <Box
        animation={animations.slideUp}
        opacity="0"
        position="relative"
        padding={8}
        borderRadius="2xl"
        bg="rgba(255, 255, 255, 0.9)"
        backdropFilter="blur(10px)"
        boxShadow="xl"
        _after={{
          content: '""',
          position: 'absolute',
          inset: '-3px',
          borderRadius: '2xl',
          border: '2px solid',
          borderColor: '#FC8019',
          opacity: 0.3,
          animation: animations.pulse
        }}
      >
        <Box animation={animations.float}>
          <Image
            src={sai}
            alt="Logo"
            width="220px"
            height="auto"
            objectFit="contain"
            filter="drop-shadow(0 4px 6px rgba(252, 128, 25, 0.2))"
          />
        </Box>
        
        {/* Shimmer Effect - Confined to Logo Box */}
        <Box
          position="absolute"
          inset="0"
          overflow="hidden"
          borderRadius="2xl"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            background="linear-gradient(135deg, transparent, rgba(255,255,255,0.8), transparent)"
            animation={`${shimmerKeyframes} 2.5s infinite`}
            style={{ transformOrigin: '0 0' }}
          />
        </Box>
      </Box>

      {/* Tagline */}
      <Text
        fontSize="2xl"
        color="white"
        fontWeight="bold"
        textAlign="center"
        opacity="0"
        animation={`${animations.fadeIn} 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s forwards`}
        letterSpacing="wider"
        mb={2}
        mt={-4}
        textShadow="0 2px 4px rgba(0,0,0,0.2)"
        transform="translateZ(0)"
        willChange="transform, opacity"
      >
        Less Waiting, Healthy Eating
      </Text>

      {/* Loading Text */}
      <Text
        fontSize="lg"
        bgGradient="linear(to-r, gray.600, gray.400)"
        bgClip="text"
        opacity="0"
        animation={`${animations.slideUp} 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards`}
        fontWeight="semibold"
        letterSpacing="wider"
        textTransform="uppercase"
      >
        Loading Experience
      </Text>

      {/* Loading Dots */}
      <Flex
        gap={3}
        opacity="0"
        animation={`${animations.slideUp} 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s forwards`}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            width="12px"
            height="12px"
            borderRadius="full"
            bgGradient="linear(to-br, #FC8019, #fd9642)"
            animation={`${animations.dot} 1.4s infinite ${i * 0.2}s`}
            opacity="0.3"
            boxShadow="0 2px 4px rgba(252, 128, 25, 0.2)"
          />
        ))}
      </Flex>

      {/* Progress Bar */}
      <Box
        position="absolute"
        bottom="0"
        left="0"
        width="full"
        height="4px"
        bg="gray.100"
        overflow="hidden"
      >
        <Box
          height="full"
          bgGradient="linear(to-r, #FC8019, #fd9642)"
          width="0"
          animation="progressBar 2.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
          sx={{
            "@keyframes progressBar": {
              "0%": { width: "0%", opacity: 0.7 },
              "50%": { opacity: 1 },
              "100%": { width: "100%", opacity: 0.9 }
            }
          }}
          boxShadow="0 0 10px rgba(252, 128, 25, 0.3)"
        />
      </Box>
    </Flex>
  );
};

export default LoadingScreen;