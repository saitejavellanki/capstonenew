import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Image,
  useBreakpointValue,
  keyframes,
  HStack,
  Circle
} from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import burger from "../../Assets/Untitled design (2).png"
import fost from "../../Assets/Fos t.png"

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(1.1); }
  to { opacity: 1; transform: scale(1); }
`;

const BannerCarousel = ({ images = [
  {
    id: 1,
    imageUrl: burger
  },
  {
    id: 2,
    imageUrl: fost
  },
  
] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Move all breakpoint values to the top level
  const bannerHeight = useBreakpointValue({ base: '200px', md: '400px', lg: '500px' });
  const navButtonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const navButtonSpacing = useBreakpointValue({ base: 2, md: 4 });
  const indicatorSize = useBreakpointValue({ base: 2, md: 3 });

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <Box position="relative" width="full" overflow="hidden">
      <Box
        height={bannerHeight}
        position="relative"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="xl"
      >
        {images.map((image, index) => (
          <Box
            key={image.id}
            position="absolute"
            top="0"
            left="0"
            width="full"
            height="full"
            opacity={index === currentSlide ? 1 : 0}
            transition="opacity 0.5s ease-in-out"
            animation={index === currentSlide ? `${fadeIn} 0.5s ease-in-out` : undefined}
          >
            <Image
              src={image.imageUrl}
              alt={`Slide ${index + 1}`}
              objectFit="cover"
              width="full"
              height="full"
            />
          </Box>
        ))}

        <IconButton
          icon={<ChevronLeft />}
          aria-label="Previous slide"
          position="absolute"
          left={navButtonSpacing}
          top="50%"
          transform="translateY(-50%)"
          onClick={prevSlide}
          colorScheme="whiteAlpha"
          borderRadius="full"
          size={navButtonSize}
          opacity={0.7}
          _hover={{ opacity: 1 }}
        />
        <IconButton
          icon={<ChevronRight />}
          aria-label="Next slide"
          position="absolute"
          right={navButtonSpacing}
          top="50%"
          transform="translateY(-50%)"
          onClick={nextSlide}
          colorScheme="whiteAlpha"
          borderRadius="full"
          size={navButtonSize}
          opacity={0.7}
          _hover={{ opacity: 1 }}
        />

        <HStack
          position="absolute"
          bottom={4}
          left="50%"
          transform="translateX(-50%)"
          spacing={2}
        >
          {images.map((_, index) => (
            <Circle
              key={index}
              size={indicatorSize}
              bg={currentSlide === index ? 'white' : 'whiteAlpha.600'}
              cursor="pointer"
              onClick={() => goToSlide(index)}
              transition="all 0.2s"
              _hover={{ transform: 'scale(1.2)' }}
            />
          ))}
        </HStack>
      </Box>
    </Box>
  );
};

export default BannerCarousel;