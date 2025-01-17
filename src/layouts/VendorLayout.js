import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
  Badge,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Avatar,
  Tooltip,
  Divider,
  IconButton,
  keyframes
} from '@chakra-ui/react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  BarChart2,
  TrendingUp,
  Star,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
  ChevronDown,
  Users,
  HelpCircle,
  Package,
  LineChart,
} from 'lucide-react';

const shineAnimation = keyframes`
  0% { background-position: -100px; }
  100% { background-position: 200px; }
`;

const theme = {
  colors: {
    bg: {
      primary: '#ffffff',
      secondary: '#f7f7f7',
      hover: '#f1f5f9',
      active: '#e6f0ff',
    },
    text: {
      primary: '#1a202c',
      secondary: '#4a5568',
      active: '#2563eb',
    },
    border: '#e2e8f0',
    badge: {
      bg: '#fff7e6',
      text: '#b45309',
    },
  },
};

const VendorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [vendorInfo, setVendorInfo] = useState({
    name: 'Vendor Name',
    avatar: '/api/placeholder/40/40',
    storeName: 'Store Name',
    subscription: 'premium',
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        onClose();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  const navItems = [
    {
      label: 'Orders',
      path: '/vendor/PendingVendors',
      icon: ShoppingBag,
    },
    {
      label: 'Processing',
      path: '/vendor/ProcessingVendors',
      icon: Clock,
    },
    {
      label: 'Completed',
      path: '/vendor/CompletedVendor',
      icon: CheckCircle,
    },
    {
      label: 'Item Management',
      path: '/vendor/items',
      icon: Package,
    },
    {
      label: 'Analytics',
      path: '/vendor/AnalyticVendor',
      icon: BarChart2,
    },
    {
      label: 'Advanced Analytics',
      path: '/vendor/AdvancedAnalytics',
      icon: LineChart,
      isPremium: true,
    },
    // {
    //   label: 'Inventory Management',
    //   path: '/vendor/InventoryManagement',
    //   icon: Users,
    //   isPremium: true,
    // },
    {
      label: 'History',
      path: '/vendor/HistoryVendor',
      icon: TrendingUp,
    },
  ];

  const PremiumBadge = () => (
    <Badge
      ml={2}
      px={2}
      py={0.5}
      bg={theme.colors.badge.bg}
      color={theme.colors.badge.text}
      rounded="full"
      fontSize="xs"
      display="flex"
      alignItems="center"
      sx={{
        background: `linear-gradient(90deg, ${theme.colors.badge.bg}, #FFD700, ${theme.colors.badge.bg})`,
        backgroundSize: '300px',
        animation: `${shineAnimation} 3s infinite linear`
      }}
    >
      <Icon as={Star} w={3} h={3} mr={1} />
      PREMIUM
    </Badge>
  );

  const NavItemContent = ({ item, isActive }) => (
    <Flex
      align="center"
      px={6}
      py={3}
      cursor="pointer"
      role="group"
      bg={isActive ? theme.colors.bg.active : 'transparent'}
      color={isActive ? theme.colors.text.active : theme.colors.text.secondary}
      borderRight={isActive ? '4px' : '0px'}
      borderColor={theme.colors.text.active}
      transition="all 0.2s"
      _hover={{
        bg: isActive ? theme.colors.bg.active : theme.colors.bg.hover,
      }}
    >
      <Icon
        as={item.icon}
        w={5}
        h={5}
        mr={3}
        stroke={isActive ? theme.colors.text.active : theme.colors.text.secondary}
        strokeWidth={2}
      />
      {!isCollapsed && (
        <>
          <Text fontWeight="medium">
            {item.label}
          </Text>
          {item.isPremium && <PremiumBadge />}
        </>
      )}
    </Flex>
  );

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <Flex h="100vh" overflow="hidden">
      {/* Mobile Menu Button */}
      {isMobile && (
        <IconButton
          icon={<MenuIcon />}
          position="fixed"
          top={4}
          left={4}
          zIndex={20}
          onClick={onOpen}
        />
      )}

      {/* Sidebar */}
      <Box
        as="nav"
        w={isCollapsed ? '20' : '64'}
        bg={theme.colors.bg.primary}
        borderRight="1px"
        borderColor={theme.colors.border}
        h="100vh"
        position="fixed"
        display={isMobile ? 'none' : 'flex'}
        flexDirection="column"
      >
        {/* Sidebar Header */}
        <Flex p={4} justify="space-between" align="center" flexShrink={0}>
          {!isCollapsed && (
            <Heading size="md" color={theme.colors.text.primary}>
              Vendor Dashboard
            </Heading>
          )}
          <IconButton
            icon={isCollapsed ? <MenuIcon /> : <X />}
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
          />
        </Flex>

        {/* Sidebar Navigation - Scrollable */}
        <Box flex="1" overflowY="auto" py={4}>
          <VStack spacing={0} align="stretch">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip
                  key={item.path}
                  label={isCollapsed ? item.label : ''}
                  placement="right"
                  isDisabled={!isCollapsed}
                >
                  <Box>
                    <NavLink
                      to={item.path}
                      style={{ textDecoration: 'none' }}
                    >
                      <NavItemContent item={item} isActive={isActive} />
                    </NavLink>
                  </Box>
                </Tooltip>
              );
            })}
          </VStack>
        </Box>

        {/* Sidebar Footer */}
        <Box
          p={4}
          borderTop="1px"
          borderColor={theme.colors.border}
          bg={theme.colors.bg.primary}
          flexShrink={0}
        >
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              w="full"
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? 'center' : 'flex-start'}
            >
              <HStack spacing={3}>
                <Avatar size="sm" src={vendorInfo.avatar} />
                {!isCollapsed && (
                  <Box flex="1">
                    <Text fontSize="sm" fontWeight="medium">
                      {vendorInfo.name}
                    </Text>
                    <Text fontSize="xs" color={theme.colors.text.secondary}>
                      {vendorInfo.storeName}
                    </Text>
                  </Box>
                )}
                {!isCollapsed && <ChevronDown size={16} />}
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<Settings size={16} />}>Settings</MenuItem>
              <MenuItem icon={<HelpCircle size={16} />}>Help Center</MenuItem>
              <Divider />
              <MenuItem icon={<LogOut size={16} />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Vendor Dashboard</DrawerHeader>
          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    style={{ textDecoration: 'none' }}
                    onClick={onClose}
                  >
                    <NavItemContent item={item} isActive={isActive} />
                  </NavLink>
                );
              })}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Box
        ml={isMobile ? 0 : isCollapsed ? '20' : '64'}
        flex="1"
        display="flex"
        flexDirection="column"
        h="100vh"
      >
        {/* Main Content Area - Scrollable */}
        <Box flex="1" overflowY="auto" bg={theme.colors.bg.secondary} p={8}>
          <Outlet />
        </Box>
      </Box>
    </Flex>
  );
};

export default VendorLayout;