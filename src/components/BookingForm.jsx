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
  Text,
  Textarea,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, getDay, setHours, setMinutes, isBefore, addMinutes, parse } from "date-fns";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";

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
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");

  // Fetch blocked times from Firestore
  useEffect(() => {
    const fetchBlockedTimes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "blocked_times"));
        const blocked = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          date: doc.data().date,
          time: doc.data().time,
        }));
        setBlockedTimes(blocked);
      } catch (error) {
        console.error("Error fetching blocked times:", error);
      }
    };

    fetchBlockedTimes();
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

    // Prevent booking if the time slot is blocked
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

    // Send email notifications
    const emailParams = {
      service: formData.service,
      date: format(formData.date, "MMMM dd, yyyy"),
      time: formattedTime,
      notes: formData.notes || "No additional notes.",
      name: formData.name,
      email: formData.email,
    };

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (response) => console.log("Admin email sent successfully!", response),
        (error) => console.error("Admin email send failed:", error)
      );

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_CONFIRMATION_TEMPLATE_ID,
        emailParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      )
      .then(
        (response) => console.log("Confirmation email sent successfully!", response),
        (error) => console.error("Confirmation email send failed:", error)
      );
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
    const formattedTime = format(parse(time, "h:mm a", new Date()), "h:mm a");

    return blockedTimes.some(
      (block) => block.date === formattedDate && block.time === formattedTime
    );
  };

  return (
    <Box
  maxW="500px"
  mx="auto"
  mt={10}
  p={6}
  borderWidth="1px"
  borderRadius="lg"
  boxShadow="lg"
  bg={bgColor}
  borderColor={borderColor}
  color={textColor}
>      <Heading size="lg" mb={4} textAlign="center">
        Book an Appointment
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* 1️⃣ Service Selection */}
          <FormControl isRequired isInvalid={errors.service}>
            <FormLabel>Select a Service</FormLabel>
            <Select name="service" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
              <option value="">Select...</option>
              <option value="web-design">Web Design</option>
              <option value="seo-consulting">Consulting</option>
              <option value="custom-software">Mawmaw's Biscuit Service</option>
            </Select>
          </FormControl>

          {/* 2️⃣ Date Picker */}
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

          {/* 3️⃣ Time Selection */}
          <FormControl isRequired isInvalid={errors.time}>
            <FormLabel>Select a Time</FormLabel>
            <Select name="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })}>
              {generateTimeSlots().map((time, index) =>
                !isTimeBlocked(formData.date, format(time, "h:mm a")) ? (
                  <option key={index} value={format(time, "h:mm a")}>{format(time, "h:mm a")}</option>
                ) : null
              )}
            </Select>
          </FormControl>

          {/* 4️⃣ Additional Notes */}
          <FormControl>
            <FormLabel>Additional Notes</FormLabel>
            <Textarea name="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special requests or details?" />
          </FormControl>

          {/* 5️⃣ Name & Email Fields */}
          <FormControl isRequired isInvalid={errors.name}>
            <FormLabel>Name</FormLabel>
            <Input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </FormControl>

          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </FormControl>

          <Button type="submit" colorScheme="blue" width="full">Book Appointment</Button>
        </VStack>
      </form>
    </Box>
  );
}
