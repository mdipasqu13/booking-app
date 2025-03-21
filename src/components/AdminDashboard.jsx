import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  FormControl,
  FormLabel,
  Select,
  VStack,
  Input,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { format, parseISO } from "date-fns";

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const tableHeaderColor = useColorModeValue("gray.100", "gray.700");

  useEffect(() => {
    fetchAppointments();
    fetchBlockedTimes();
  }, []);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const bookings = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      bookings.sort((a, b) => {
        const dateA = parseISO(a.date);
        const dateB = parseISO(b.date);
        return dateA - dateB || a.time.localeCompare(b.time);
      });
      setAppointments(bookings);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchBlockedTimes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "blocked_times"));
      const blocks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlockedTimes(blocks);
    } catch (error) {
      console.error("Error fetching blocked times:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "bookings", id));
      setAppointments(appointments.filter((a) => a.id !== id));
      toast({
        title: "Appointment deleted.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleBlockTime = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both a date and a time to block.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addDoc(collection(db, "blocked_times"), {
        date: selectedDate,
        time: selectedTime,
      });

      toast({
        title: "Time slot blocked!",
        description: `Blocked ${selectedDate} at ${selectedTime}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      fetchBlockedTimes();
      setSelectedDate("");
      setSelectedTime("");
    } catch (error) {
      console.error("Error blocking time slot:", error);
    }
  };

  const handleUnblockTime = async (id) => {
    try {
      await deleteDoc(doc(db, "blocked_times", id));
      setBlockedTimes(blockedTimes.filter((block) => block.id !== id));

      toast({
        title: "Time slot unblocked!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error unblocking time slot:", error);
    }
  };

  return (
    <Box
      maxW="1100px"
      mx="auto"
      mt={10}
      p={6}
      borderWidth="1px"
      borderRadius="lg"
      boxShadow="lg"
      bg={bgColor}
      borderColor={borderColor}
    >
      <Heading size="lg" mb={6} textAlign="center">
        Admin Dashboard
      </Heading>

      <Tabs variant="enclosed" colorScheme="blue" isFitted>
        <TabList mb={4}>
          <Tab>Block Time</Tab>
          <Tab>Blocked Times</Tab>
          <Tab>Appointments</Tab>
        </TabList>

        <TabPanels>
          {/* Block Time */}
          <TabPanel>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Block a Timeslot</Heading>
              <FormControl>
                <FormLabel>Select a Date</FormLabel>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
              </FormControl>

              <FormControl>
                <FormLabel>Select a Time</FormLabel>
                <Select value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)}>
                  <option value="">Select a time...</option>
                  {[
                    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
                    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
                    "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
                    "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
                  ].map((time, index) => (
                    <option key={index} value={time}>{time}</option>
                  ))}
                </Select>
              </FormControl>

              <Button colorScheme="red" onClick={handleBlockTime}>
                Block Time Slot
              </Button>
            </VStack>
          </TabPanel>

          {/* Blocked Times */}
          <TabPanel>
            <Heading size="md" mb={4}>Blocked Time Slots</Heading>
            {blockedTimes.length > 0 ? (
              <Table variant="simple">
                <Thead bg={tableHeaderColor}>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {blockedTimes.map((block) => (
                    <Tr key={block.id}>
                      <Td>{block.date}</Td>
                      <Td>{block.time}</Td>
                      <Td>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() => handleUnblockTime(block.id)}
                        >
                          Unblock
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No blocked times.</Text>
            )}
          </TabPanel>

          {/* Appointments */}
          <TabPanel>
            <Heading size="md" mb={4}>Booked Appointments</Heading>
            {appointments.length > 0 ? (
              <Table variant="simple">
                <Thead bg={tableHeaderColor}>
                  <Tr>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Service</Th>
                    <Th>Date</Th>
                    <Th>Time</Th>
                    <Th>Notes</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {appointments.map((appointment) => (
                    <Tr key={appointment.id}>
                      <Td>{appointment.name}</Td>
                      <Td>{appointment.email}</Td>
                      <Td>{appointment.service}</Td>
                      <Td>{appointment.date}</Td>
                      <Td>{appointment.time}</Td>
                      <Td>{appointment.notes || "No additional notes."}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No appointments booked.</Text>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}
