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

  const bg = useColorModeValue("white", "gray.800");
  const text = useColorModeValue("gray.800", "gray.100");
  const border = useColorModeValue("gray.200", "gray.600");

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
      setAppointments((prev) => prev.filter((appointment) => appointment.id !== id));
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
      setBlockedTimes((prev) => prev.filter((block) => block.id !== id));

      toast({
        title: "Time slot unblocked!",
        description: "The selected blocked time has been removed.",
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
      bg={bg}
      borderColor={border}
      color={text}
      minH="100vh"
    >
      <Heading size="lg" mb={4} textAlign="center">
        Admin Dashboard
      </Heading>

      {/* Block Time Slot Form */}
      <VStack spacing={4} align="stretch" mb={6}>
        <Heading size="md">Block a Timeslot</Heading>
        <FormControl>
          <FormLabel>Select a Date</FormLabel>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            bg={bg}
            color={text}
            borderColor={border}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Select a Time</FormLabel>
          <Select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            bg={bg}
            color={text}
            borderColor={border}
          >
            <option value="">Select a time...</option>
            {[
              "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
              "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM",
              "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
            ].map((time, index) => (
              <option key={index} value={time}>
                {time}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button colorScheme="red" onClick={handleBlockTime}>
          Block Time Slot
        </Button>
      </VStack>

      {/* Blocked Times */}
      <Heading size="md" mb={4}>
        Blocked Time Slots
      </Heading>
      {blockedTimes.length > 0 ? (
        <Table variant="simple">
          <Thead>
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
                  <Button colorScheme="blue" size="sm" onClick={() => handleUnblockTime(block.id)}>
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

      {/* Appointments Table */}
      <Heading size="md" mt={6} mb={4}>
        Booked Appointments
      </Heading>
      {appointments.length > 0 ? (
        <Table variant="simple">
          <Thead>
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
                  <Button colorScheme="red" size="sm" onClick={() => handleDelete(appointment.id)}>
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
    </Box>
  );
}
