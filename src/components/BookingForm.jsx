import { useState } from "react";
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
  useToast,
} from "@chakra-ui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, getDay, setHours, setMinutes, isBefore, addMinutes } from "date-fns";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function BookingForm() {
  const [formData, setFormData] = useState({
    service: "",
    name: "",
    email: "",
    phone: "",
    date: null, 
    time: null, 
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();

  const validateForm = () => {
    let newErrors = {};

    if (!formData.service) newErrors.service = "Please select a service.";
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email.";
    }
    if (!formData.date) newErrors.date = "Please select a date.";
    if (!formData.time) newErrors.time = "Please select a time.";
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Phone number should only contain digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    const formattedTime = formData.time || "";
  
    try {
      await addDoc(collection(db, "bookings"), {
        service: formData.service,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        date: formData.date ? formData.date.toISOString() : "",
        time: formattedTime,
        createdAt: new Date(),
      });
  
      toast({
        title: "Appointment booked!",
        description: `You have booked ${formData.service} on ${format(formData.date, "MMMM dd, yyyy")} at ${formattedTime}.`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });
  
      setFormData({ service: "", name: "", email: "", phone: "", date: null, time: null });
      setErrors({});
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

   // Disable weekends in the Date Picker
   const isWeekday = (date) => {
    const day = getDay(date);
    return day !== 0 && day !== 6; // Disables Saturday (6) & Sunday (0)
  };

  // Generate available time slots (9:00 AM - 5:00 PM, every 30 minutes)
  const generateTimeSlots = () => {
    let times = [];
    let startTime = setHours(setMinutes(new Date(), 0), 9); // Start at 9:00 AM
    let endTime = setHours(setMinutes(new Date(), 0), 17); // End at 5:00 PM

    while (isBefore(startTime, endTime)) {
      times.push(startTime);
      startTime = addMinutes(startTime, 30); // Increment by 30 minutes
    }

    return times;
  };

  return (
    <Box maxW="500px" mx="auto" mt={10} p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg" bg="white">
      <Heading size="lg" mb={4} textAlign="center">
        Book an Appointment
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          {/* Service Selection */}
          <FormControl isRequired isInvalid={errors.service}>
            <FormLabel>Select a Service</FormLabel>
            <Select name="service" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })}>
              <option value="">Select...</option>
              <option value="web-design">Web Design</option>
              <option value="seo-consulting">Consulting</option>
              <option value="custom-software">Mawmaw's Biscuit Service</option>
            </Select>
            {errors.service && <Text color="red.500">{errors.service}</Text>}
          </FormControl>

          {/* Name */}
          <FormControl isRequired isInvalid={errors.name}>
            <FormLabel>Full Name</FormLabel>
            <Input type="text" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            {errors.name && <Text color="red.500">{errors.name}</Text>}
          </FormControl>

          {/* Email */}
          <FormControl isRequired isInvalid={errors.email}>
            <FormLabel>Email</FormLabel>
            <Input type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            {errors.email && <Text color="red.500">{errors.email}</Text>}
          </FormControl>

          {/* Phone */}
          <FormControl isInvalid={errors.phone}>
            <FormLabel>Phone (Optional)</FormLabel>
            <Input type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            {errors.phone && <Text color="red.500">{errors.phone}</Text>}
          </FormControl>

           {/* Date Picker (Disable Weekends) */}
           <FormControl isRequired isInvalid={errors.date}>
            <FormLabel>Select a Date</FormLabel>
            <DatePicker
              selected={formData.date}
              onChange={(date) => setFormData({ ...formData, date })}
              dateFormat="MMMM d, yyyy"
              minDate={new Date()} // Prevent past dates
              filterDate={isWeekday} // Disable weekends
              placeholderText="Click to select a date"
              className="chakra-input"
            />
            {errors.date && <Text color="red.500">{errors.date}</Text>}
          </FormControl>

         {/* Time Picker (Business Hours Only) */}
         <FormControl isRequired isInvalid={errors.time}>
            <FormLabel>Select a Time</FormLabel>
            <Select
                name="time"
                value={formData.time || ""}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            >
                <option value="">Select a time...</option>
                {generateTimeSlots().map((time, index) => (
                    <option key={index} value={format(time, "h:mm a")}>
                    {format(time, "h:mm a")}
                    </option>
                ))}
            </Select>
            {errors.time && <Text color="red.500">{errors.time}</Text>}
        </FormControl>

          {/* Submit Button */}
          <Button type="submit" colorScheme="blue" width="full">
            Book Appointment
          </Button>
        </VStack>
      </form>
    </Box>
  );
}