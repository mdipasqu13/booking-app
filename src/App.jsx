import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Button,
  IconButton,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, HamburgerIcon } from "@chakra-ui/icons";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import { auth, onAuthStateChanged, signOut } from "./firebase";
import PrivateRoute from "./components/PrivateRoute";
import NotFound from "./components/NotFound";


export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsAdmin(false);
    navigate("/admin-login");
  };

  return (
    <Box maxW="100%" minH="100vh" bg={useColorModeValue("gray.50", "gray.900")}>
      {/* Responsive Navbar */}
      <Flex
        as="nav"
        bg="blue.500"
        color="white"
        align="center"
        justify="space-between"
        wrap="wrap"
        px={4}
        py={3}
      >
        <Text fontWeight="bold" fontSize="lg">
          My Booking Site
        </Text>

        <Flex align="center" gap={2}>
          {/* Light/Dark Mode Toggle */}
          <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            color="white"
            aria-label="Toggle color mode"
          />

          {/* Desktop Nav Links */}
          <Flex
            display={{ base: "none", md: "flex" }}
            align="center"
            gap={2}
          >
            <Button as={Link} to="/" variant="ghost" color="white">
              Book Appointment
            </Button>
            {!isAdmin ? (
              <Button as={Link} to="/admin-login" variant="ghost" color="white">
                Admin Login
              </Button>
            ) : (
              <>
                <Button as={Link} to="/admin" variant="ghost" color="white">
                  Admin Dashboard
                </Button>
                <Button onClick={handleLogout} variant="ghost" color="white">
                  Logout
                </Button>
              </>
            )}
          </Flex>

          {/* Mobile Menu */}
          <Box display={{ base: "block", md: "none" }}>
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<HamburgerIcon />}
                variant="ghost"
                color="white"
                aria-label="Open menu"
              />
              <MenuList>
                <MenuItem as={Link} to="/">Book Appointment</MenuItem>
                {!isAdmin ? (
                  <MenuItem as={Link} to="/admin-login">Admin Login</MenuItem>
                ) : (
                  <>
                    <MenuItem as={Link} to="/admin">Admin Dashboard</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </>
                )}
              </MenuList>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      {/* Page Routes */}
      <Box px={[4, 6, 8]} py={[4, 6]}>
        <Routes>
          <Route path="/" element={<BookingForm />} />
          <Route path="/admin-login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
}
