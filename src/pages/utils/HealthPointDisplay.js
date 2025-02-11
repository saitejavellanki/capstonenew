import React from 'react';
import {
  Box,
  VStack,
  Text,
  Progress,
  Tooltip,
  HStack,
  Icon,
  useColorModeValue,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Badge
} from '@chakra-ui/react';
import { StarIcon, InfoIcon } from '@chakra-ui/icons';

const HealthPointsDisplay = ({ points, maxPoints = 100 }) => {
  // Color mode values for light/dark theme - using more retro-styled colors
  const cardBg = useColorModeValue('gray.900', 'gray.800');
  const borderColor = useColorModeValue('cyan.400', 'cyan.500');
  const textColor = useColorModeValue('green.400', 'green.300');
  const progressFillColor = useColorModeValue('red.400', 'red.500');

  // Define level thresholds and titles
  const levels = [
    { threshold: 0, title: 'NOVICE', color: 'gray.400' },
    { threshold: 25, title: 'SQUIRE', color: 'blue.400' },
    { threshold: 50, title: 'KNIGHT', color: 'purple.400' },
    { threshold: 75, title: 'WARRIOR', color: 'orange.400' },
    { threshold: 100, title: 'TITAN', color: 'red.400' }
  ];

  // Calculate current level
  const currentLevel = levels.reduce((prev, curr) => 
    points >= curr.threshold ? curr : prev
  );

  // Calculate next level
  const nextLevelIndex = levels.findIndex(level => level.title === currentLevel.title) + 1;
  const nextLevel = levels[nextLevelIndex];

  // Calculate health percentage
  const healthPercentage = (points / maxPoints) * 100;

  return (
    <Box
      p={6}
      borderRadius="lg"
      bg={cardBg}
      borderWidth="4px"
      borderColor={borderColor}
      shadow="lg"
      position="relative"
      overflow="hidden"
    >
      {/* Scanline Effect */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        backgroundImage="linear-gradient(
          transparent 50%,
          rgba(0, 0, 0, 0.1) 50%
        )"
        backgroundSize="100% 4px"
        opacity={0.2}
      />

      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack spacing={4}>
            <Text 
              fontSize="2xl" 
              fontFamily="'Press Start 2P', monospace" 
              color={textColor}
              textShadow="0 0 5px"
            >
              HP
            </Text>
            <Badge
              colorScheme={currentLevel.title === 'TITAN' ? 'red' : 'purple'}
              variant="solid"
              fontSize="lg"
              px={3}
              py={1}
            >
              {currentLevel.title}
            </Badge>
          </HStack>
          <Tooltip
            label="View detailed level information"
            placement="top"
            bg="gray.800"
            color="green.300"
          >
            <InfoIcon 
              color={textColor} 
              w={6} 
              h={6} 
              cursor="pointer"
              onClick={() => window.location.href = '/levels'}
            />
          </Tooltip>
        </Flex>

        <Flex justify="space-between" align="center" gap={6}>
          <CircularProgress
            value={healthPercentage}
            size="120px"
            thickness="8px"
            color={currentLevel.color}
            trackColor="gray.700"
          >
            <CircularProgressLabel color={textColor} fontSize="xl">
              {points}
            </CircularProgressLabel>
          </CircularProgress>

          <Box flex="1">
            <Box position="relative">
              <Progress
                value={healthPercentage}
                size="lg"
                colorScheme="green"
                bgGradient="linear(to-r, red.500, yellow.500)"
                hasStripe
                isAnimated
                borderRadius="md"
                height="24px"
                sx={{
                  '& > div': {
                    transition: 'width 0.3s ease-in-out',
                  }
                }}
              />
              {/* Pixel overlay effect */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                pointerEvents="none"
                backgroundImage="linear-gradient(
                  90deg,
                  transparent 50%,
                  rgba(255, 255, 255, 0.1) 50%
                )"
                backgroundSize="4px 100%"
                opacity={0.2}
              />
            </Box>
            {nextLevel && (
              <Text
                mt={2}
                fontSize="sm"
                color={textColor}
                fontFamily="monospace"
                textAlign="right"
              >
                Next: {nextLevel.title} ({nextLevel.threshold - points} pts)
              </Text>
            )}
          </Box>
        </Flex>
      </VStack>
    </Box>
  );
};

export default HealthPointsDisplay;