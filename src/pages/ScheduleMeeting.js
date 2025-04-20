import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Grid,
  Container,
  useTheme,
  Grow,
  Avatar,
  LinearProgress,
  Stack
} from '@mui/material';
import { 
  AccessTime as AccessTimeIcon,
  Send as SendIcon,
  Check as CheckIcon,
  CalendarMonth,
  People as PeopleIcon,
  Schedule,
  ArrowForward,
  Timer,
  Star as StarIcon,
  GroupAdd,
  Check,
  PlaylistAdd
} from '@mui/icons-material';
import { suggestMeetingTimes } from '../services/aiService';
import { createCalendarEvent } from '../services/calendarService';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

function ScheduleMeeting() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingAI, setProcessingAI] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const theme = useTheme();
  const navigate = useNavigate();
  
  // Meeting details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState('');
  const [duration, setDuration] = useState(30);
  const [location, setLocation] = useState('');
  
  // Suggested times
  const [suggestedTimes, setSuggestedTimes] = useState([]);
  
  // Selected time
  const [selectedTime, setSelectedTime] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.4,
        when: "beforeChildren",
        staggerChildren: 0.1,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const steps = [
    {
      label: 'Meeting Details',
      icon: <PlaylistAdd />,
      description: 'Enter the meeting information'
    },
    {
      label: 'AI Suggestions',
      icon: <Schedule />,
      description: 'Choose from AI-recommended time slots'
    },
    {
      label: 'Confirm & Schedule',
      icon: <Check />,
      description: 'Review and finalize your meeting'
    }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setTitle('');
    setDescription('');
    setAttendees('');
    setDuration(30);
    setSuggestedTimes([]);
    setSelectedTime(null);
    setSuccess('');
    setError('');
    setLocation('');
  };

  const validateStep = () => {
    if (activeStep === 0) {
      if (!title.trim()) {
        setError('Please enter a meeting title');
        return false;
      }
      if (!attendees.trim()) {
        setError('Please enter at least one attendee email');
        return false;
      }
    } else if (activeStep === 1) {
      if (!selectedTime) {
        setError('Please select a time slot');
        return false;
      }
    }
    
    setError('');
    return true;
  };

  const getAISuggestions = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setProcessingAI(true);
    try {
      // Parse attendees from comma-separated string to array
      const attendeeList = attendees.split(',').map(email => email.trim());
      
      // Get AI suggestions based on meeting details and calendar availability
      const suggestions = await suggestMeetingTimes({
        title,
        description,
        attendees: attendeeList,
        duration
      });
      
      setSuggestedTimes(suggestions);
      handleNext();
    } catch (err) {
      console.error('Error getting AI suggestions:', err);
      setError('Failed to get AI suggestions. Please try again.');
    } finally {
      setLoading(false);
      setProcessingAI(false);
    }
  };

  const scheduleMeeting = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    try {
      // Parse attendees from comma-separated string to array
      const attendeeList = attendees.split(',').map(email => email.trim());
      
      // Create calendar event
      const result = await createCalendarEvent({
        title,
        description,
        attendees: attendeeList,
        startTime: selectedTime.start,
        endTime: selectedTime.end,
        location: location
      });
      
      console.log("Created meeting:", result);
      
      setSuccess('Meeting successfully scheduled!');
      handleNext();
    } catch (err) {
      console.error('Error scheduling meeting:', err);
      setError('Failed to schedule meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const options = { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  // Randomly generate suggested times for demo purposes
  const getDemoSuggestedTimes = () => {
    const now = new Date();
    const times = [];
    
    for (let i = 1; i <= 5; i++) {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() + i);
      startDate.setHours(9 + Math.floor(Math.random() * 8), Math.random() > 0.5 ? 0 : 30, 0);
      
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + duration);
      
      times.push({
        id: i,
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        score: Math.round(70 + Math.random() * 30), // Random score between 70-100
        reason: "Based on participants' availability and past meeting patterns"
      });
    }
    
    return times;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants}>
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            Schedule a Meeting
          </Typography>
          
          <Typography 
            variant="h6" 
            align="center" 
            sx={{ 
              mb: 5, 
              color: theme.palette.text.secondary,
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Let AI find the perfect time for your next meeting
          </Typography>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Stepper 
            activeStep={activeStep} 
            alternativeLabel 
            sx={{ 
              mb: 5,
              '& .MuiStepLabel-label': {
                mt: 1,
              }
            }}
          >
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel 
                  StepIconComponent={() => (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: activeStep >= index ? theme.palette.primary.main : theme.palette.grey[300],
                        color: activeStep >= index ? 'white' : theme.palette.text.secondary,
                      }}
                    >
                      {step.icon}
                    </Avatar>
                  )}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </motion.div>
        
        {error && (
          <motion.div variants={itemVariants}>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
          </motion.div>
        )}
        {success && (
          <motion.div variants={itemVariants}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>{success}</Alert>
          </motion.div>
        )}
        
        <motion.div variants={itemVariants}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {activeStep === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Enter Meeting Details
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Meeting Title"
                      variant="outlined"
                      fullWidth
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: (
                          <CalendarMonth color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Description"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Location (optional)"
                      variant="outlined"
                      fullWidth
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Virtual Meeting / Conference Room / etc."
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Attendees (comma-separated emails)"
                      variant="outlined"
                      fullWidth
                      value={attendees}
                      onChange={(e) => setAttendees(e.target.value)}
                      required
                      helperText="Enter email addresses separated by commas"
                      sx={{ mb: 1 }}
                      InputProps={{
                        startAdornment: (
                          <PeopleIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Meeting Duration</InputLabel>
                      <Select
                        value={duration}
                        label="Meeting Duration"
                        onChange={(e) => setDuration(e.target.value)}
                        sx={{ mb: 1 }}
                        startAdornment={
                          <AccessTimeIcon color="primary" sx={{ mr: 1, opacity: 0.7 }} />
                        }
                      >
                        <MenuItem value={15}>15 minutes</MenuItem>
                        <MenuItem value={30}>30 minutes</MenuItem>
                        <MenuItem value={45}>45 minutes</MenuItem>
                        <MenuItem value={60}>1 hour</MenuItem>
                        <MenuItem value={90}>1.5 hours</MenuItem>
                        <MenuItem value={120}>2 hours</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 5 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={getAISuggestions}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <AccessTimeIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Get AI Suggestions
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, flexGrow: 1 }}>
                    AI-Suggested Time Slots
                  </Typography>
                  
                  <Chip 
                    label={`${title}`} 
                    color="primary"
                    variant="outlined"
                    size="medium"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                
                <Typography variant="body1" color="textSecondary" paragraph>
                  Based on participants' availability and meeting patterns, these are the best times for your meeting.
                  Select one to proceed.
                </Typography>
                
                {/* When we arrive at this step, load the suggestions if we don't have any yet */}
                {suggestedTimes.length === 0 && processingAI && (
                  <Box sx={{ my: 10, textAlign: 'center' }}>
                    <motion.div
                      animate={{ 
                        rotate: 360,
                        transition: { duration: 2, repeat: Infinity, ease: 'linear' }
                      }}
                      style={{ display: 'inline-block', marginBottom: '20px' }}
                    >
                      <Schedule color="primary" sx={{ fontSize: 60 }} />
                    </motion.div>
                    <Typography variant="h6" gutterBottom>
                      AI is analyzing calendars and finding optimal times...
                    </Typography>
                    <LinearProgress sx={{ maxWidth: 400, mx: 'auto', mt: 2 }} />
                  </Box>
                )}
                
                {/* For demo purposes, generate random suggested times */}
                {suggestedTimes.length === 0 && !processingAI && setSuggestedTimes(getDemoSuggestedTimes())}
                
                <Stack spacing={2} sx={{ mt: 3 }}>
                  {suggestedTimes.map((timeSlot, index) => (
                    <Grow 
                      in={true} 
                      key={timeSlot.id}
                      timeout={(index + 1) * 200}
                    >
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedTime?.id === timeSlot.id ? `2px solid ${theme.palette.primary.main}` : '1px solid rgba(0, 0, 0, 0.12)',
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          transform: selectedTime?.id === timeSlot.id ? 'scale(1.02)' : 'scale(1)',
                          position: 'relative',
                          overflow: 'hidden',
                          boxShadow: selectedTime?.id === timeSlot.id ? '0 8px 16px rgba(0, 0, 0, 0.1)' : 'none'
                        }}
                        onClick={() => setSelectedTime(timeSlot)}
                      >
                        {/* Score indicator */}
                        <Box 
                          sx={{ 
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '4px',
                            background: `linear-gradient(90deg, 
                              ${theme.palette.error.main} 0%, 
                              ${theme.palette.warning.main} 50%, 
                              ${theme.palette.success.main} 100%)`,
                            clipPath: `polygon(0 0, ${timeSlot.score}% 0, ${timeSlot.score}% 100%, 0 100%)`
                          }}
                        />
                        
                        <CardContent sx={{ p: 3 }}>
                          <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Box display="flex" alignItems="center">
                                <Timer 
                                  sx={{ 
                                    fontSize: 32, 
                                    color: theme.palette.primary.main,
                                    mr: 2 
                                  }} 
                                />
                                <Box>
                                  <Typography variant="h6" fontWeight={600}>
                                    {formatDateTime(timeSlot.start)}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Duration: {duration} minutes
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                              <Box>
                                <Box display="flex" alignItems="center">
                                  <StarIcon 
                                    sx={{ 
                                      color: timeSlot.score > 85 
                                        ? theme.palette.success.main 
                                        : theme.palette.warning.main,
                                      mr: 1
                                    }}
                                  />
                                  <Typography 
                                    variant="h6" 
                                    fontWeight={600}
                                    sx={{ 
                                      color: timeSlot.score > 85 
                                        ? theme.palette.success.main 
                                        : theme.palette.warning.main
                                    }}
                                  >
                                    {timeSlot.score}% match
                                  </Typography>
                                </Box>
                                <Typography variant="body2" mt={0.5}>
                                  {timeSlot.reason}
                                </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} md={2} display="flex" justifyContent="flex-end" alignItems="center">
                              {selectedTime?.id === timeSlot.id && (
                                <CheckIcon 
                                  color="primary" 
                                  sx={{ 
                                    fontSize: 30,
                                    animation: 'pulse 1.5s infinite',
                                    '@keyframes pulse': {
                                      '0%': { transform: 'scale(1)' },
                                      '50%': { transform: 'scale(1.2)' },
                                      '100%': { transform: 'scale(1)' }
                                    }
                                  }}
                                />
                              )}
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grow>
                  ))}
                </Stack>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 5 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    disabled={!selectedTime}
                    endIcon={<ArrowForward />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Continue
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  Confirm Meeting Details
                </Typography>
                
                <Card
                  elevation={0}
                  sx={{ 
                    mb: 4, 
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.default
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.primary.main
                      }}
                    >
                      {title}
                    </Typography>
                    
                    {description && (
                      <Typography variant="body1" paragraph sx={{ mt: 1, mb: 3 }}>
                        {description}
                      </Typography>
                    )}
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Date & Time
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <AccessTimeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="body1" fontWeight={500}>
                              {selectedTime && formatDateTime(selectedTime.start)}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                            Duration
                          </Typography>
                          <Box display="flex" alignItems="center">
                            <Timer sx={{ mr: 1, color: theme.palette.primary.main }} />
                            <Typography variant="body1" fontWeight={500}>
                              {duration} minutes
                            </Typography>
                          </Box>
                        </Box>
                        
                        {location && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Location
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {location}
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Attendees
                        </Typography>
                        
                        <Box display="flex" alignItems="center" mb={2}>
                          <GroupAdd sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="body1" fontWeight={500}>
                            {attendees.split(',').length} participants
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {attendees.split(',').map((email, index) => (
                            <Chip 
                              key={index} 
                              label={email.trim()} 
                              variant="outlined"
                              size="medium"
                              sx={{ borderRadius: 2 }}
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    sx={{ borderRadius: 2 }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={scheduleMeeting}
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                    sx={{ 
                      py: 1.5, 
                      px: 4,
                      fontWeight: 600,
                      borderRadius: 2
                    }}
                  >
                    Schedule Meeting
                  </Button>
                </Box>
              </motion.div>
            )}
            
            {activeStep === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 260,
                      damping: 20,
                      delay: 0.2
                    }}
                  >
                    <Avatar
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        backgroundColor: theme.palette.success.main,
                        mb: 3,
                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 60 }} />
                    </Avatar>
                  </motion.div>
                  
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                    Meeting Successfully Scheduled!
                  </Typography>
                  
                  <Typography variant="h6" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                    {title}
                  </Typography>
                  
                  <Typography variant="body1" paragraph sx={{ mb: 4 }}>
                    Calendar invites have been sent to all attendees. You can view this meeting in your dashboard.
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleReset}
                      sx={{ 
                        py: 1.2, 
                        px: 3,
                        borderRadius: 2
                      }}
                    >
                      Schedule Another Meeting
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => navigate('/')}
                      sx={{ 
                        py: 1.2, 
                        px: 3,
                        borderRadius: 2
                      }}
                    >
                      Go to Dashboard
                    </Button>
                  </Box>
                </Box>
              </motion.div>
            )}
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
}

export default ScheduleMeeting;
