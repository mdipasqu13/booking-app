import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  VStack,
  Textarea,
  useToast,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  format,
  getDay,
  setHours,
  setMinutes,
  isBefore,
  addMinutes,
  parse,
} from "date-fns";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  {
    value: "web-design",
    title: "Web Design",
    description: "Modern, responsive websites tailored to your brand.",
  },
  {
    value: "seo-consulting",
    title: "SEO Consulting",
    description: "Boost your search engine rankings and online visibility.",
  },
  {
    value: "biscuit-service",
    title: "Mawmaw's Biscuit Service",
    description: "Professional Biscuit making service, paw-crafted for quality.",
  },
];

export default function BookingForm() {
  const [formData, setFormData] = useState({
    service: "",
    date: null,
    time: "",
    notes: "",
    name: "",
    email: "",
  });

  const [errors, setErrors] = useState({});
  const [blockedTimes, setBlockedTimes] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);
  const toast = useToast();

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");

  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const blockedSnapshot = await getDocs(collection(db, "blocked_times"));
        const bookingSnapshot = await getDocs(collection(db, "bookings"));

        const blocked = blockedSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));

        const booked = bookingSnapshot.docs.map((doc) => ({
          date: doc.data().date,
          time: doc.data().time,
        }));

        setBlockedTimes(blocked);
        setBookedTimes(booked);
      } catch (error) {
        console.error("Error fetching times:", error);
      }
    };
    fetchTimes();
  }, []);

  const validateForm = () => {
    let newErrors = {};
    if (!formData.service) newErrors.service = "Please select a service.";
    if (!formData.date) newErrors.date = "Please select a date.";
    if (!formData.time) newErrors.time = "Please select a time.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (isTimeBlocked(formData.date, formData.time)) {
      newErrors.time = "This time slot is unavailable. Please select another time.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formattedDate = format(formData.date, "yyyy-MM-dd");
    const formattedTime = format(parse(formData.time, "h:mm a", new Date()), "hh:mm a");

    try {
      await addDoc(collection(db, "bookings"), {
        service: formData.service,
        date: formattedDate,
        time: formattedTime,
        notes: formData.notes,
        name: formData.name,
        email: formData.email,
        createdAt: new Date(),
      });

      toast({
        title: "Appointment booked!",
        description: `You have booked ${formData.service} on ${format(formData.date, "MMMM dd, yyyy")} at ${formattedTime}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setFormData({ service: "", date: null, time: "", notes: "", name: "", email: "" });
      setErrors({});
    } catch (error) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }

    const emailParams = {
      service: formData.service,
      date: format(formData.date, "MMMM dd, yyyy"),
      time: formattedTime,
      notes: formData.notes || "No additional notes.",
      name: formData.name,
      email: formData.email,
    };

    emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    emailjs.send(import.meta.env.VITE_EMAILJS_SERVICE_ID, import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID, emailParams, import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  };

  const isWeekday = (date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6;
  };

  const generateTimeSlots = () => {
    let times = [];
    let startTime = setHours(setMinutes(new Date(), 0), 9);
    let endTime = setHours(setMinutes(new Date(), 0), 17);
    while (isBefore(startTime, endTime)) {
      times.push(startTime);
      startTime = addMinutes(startTime, 30);
    }
    return times;
  };

  const isTimeBlocked = (date, time) => {
    if (!date || !time) return false;
    const formattedDate = format(date, "yyyy-MM-dd");

    let parsedSelectedTime;
    try {
      parsedSelectedTime = parse(time, "h:mm a", new Date());
    } catch {
      return false;
    }

    const normalizedTime = format(parsedSelectedTime, "hh:mm a");

    return (
      blockedTimes.some(
        (block) =>
          block.date === formattedDate &&
          format(parse(block.time, "h:mm a", new Date()), "hh:mm a") === normalizedTime
      ) ||
      bookedTimes.some(
        (booking) =>
          booking.date === formattedDate &&
          format(parse(booking.time, "h:mm a", new Date()), "hh:mm a") === normalizedTime
      )
    );
  };

  const toggleService = (value) => {
    if (formData.service === value) {
      setFormData({ service: "", date: null, time: "", notes: "", name: "", email: "" });
    } else {
      setFormData({ ...formData, service: value, date: null, time: "" });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box
        maxW={["100%", "600px"]}
        mx="auto"
        mt={10}
        p={[4, 6]}
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="lg"
        bg={bgColor}
        borderColor={borderColor}
        color={textColor}
      >
        <Heading size="lg" mb={6} textAlign="center">
          Book an Appointment
        </Heading>

        <FormControl isRequired isInvalid={errors.service} mb={4}>
          <FormLabel>Select a Service</FormLabel>
          <VStack spacing={3} align="stretch">
            {services.map((service) => (
              <Box key={service.value}>
                <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                  <Box
                    p={4}
                    borderWidth={2}
                    borderRadius="md"
                    borderColor={formData.service === service.value ? "blue.400" : "gray.300"}
                    bg={formData.service === service.value ? "blue.50" : "transparent"}
                    cursor="pointer"
                    _hover={{ borderColor: "blue.300" }}
                    onClick={() => toggleService(service.value)}
                  >
                    <Text fontWeight="bold">{service.title}</Text>
                    <Text fontSize="sm">{service.description}</Text>
                  </Box>
                </motion.div>

                <AnimatePresence>
                  {formData.service === service.value && (
                    <motion.div
                      key="booking-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <form onSubmit={handleSubmit}>
                        <VStack spacing={4} align="stretch" mt={4}>
                          <FormControl isRequired isInvalid={errors.date}>
                            <FormLabel>Select a Date</FormLabel>
                            <DatePicker
                              selected={formData.date}
                              onChange={(date) => setFormData({ ...formData, date })}
                              dateFormat="MMMM d, yyyy"
                              minDate={new Date()}
                              filterDate={isWeekday}
                              placeholderText="Click to select a date"
                              className="chakra-input"
                            />
                          </FormControl>

                          <FormControl isRequired isInvalid={errors.time}>
                            <FormLabel>Select a Time</FormLabel>
                            <Select
                              name="time"
                              value={formData.time}
                              onChange={(e) =>
                                setFormData({ ...formData, time: e.target.value })
                              }
                            >
                              {generateTimeSlots().map((time, index) => {
                                const formatted = format(time, "h:mm a");
                                return !isTimeBlocked(formData.date, formatted) ? (
                                  <option key={index} value={formatted}>
                                    {formatted}
                                  </option>
                                ) : null;
                              })}
                            </Select>
                          </FormControl>

                          <FormControl>
                            <FormLabel>Additional Notes</FormLabel>
                            <Textarea
                              name="notes"
                              value={formData.notes}
                              onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                              }
                              placeholder="Any special requests or details?"
                            />
                          </FormControl>

                          <FormControl isRequired isInvalid={errors.name}>
                            <FormLabel>Name</FormLabel>
                            <Input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                            />
                          </FormControl>

                          <FormControl isRequired isInvalid={errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                            />
                          </FormControl>

                          <Button type="submit" colorScheme="blue" width="full">
                            Book Appointment
                          </Button>
                        </VStack>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Box>
            ))}
          </VStack>
        </FormControl>
      </Box>
    </motion.div>
  );
}
