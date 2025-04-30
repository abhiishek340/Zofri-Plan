import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader, 
  Button, 
  Divider, 
  Box, 
  CircularProgress,
  Alert,
  Chip,
  useTheme,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Container
} from '@mui/material';
import { 
  Event as EventIcon, 
  AccessTime as AccessTimeIcon,
  People as PeopleIcon,
  Room as RoomIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Alarm as AlarmIcon,
  Analytics as AnalyticsIcon,
  CalendarMonth,
  CalendarToday,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchCalendarEvents } from '../services/calendarService';
import { getDailySummary } from '../services/aiService';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [summary, setSummary] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
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

  // GSAP animations for calendar icon
  useGSAP(() => {
    if (!loading) {
      gsap.to(".calendar-icon", {
        rotation: 360,
        duration: 1.5,
        ease: "elastic.out(1, 0.3)"
      });
    }
  }, [loading]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Check if we have cached events in localStorage
        let events = [];
        try {
          const cachedEvents = localStorage.getItem('calendarEvents');
          if (cachedEvents) {
            events = JSON.parse(cachedEvents);
            console.log("Loaded events from localStorage:", events);
            setUpcomingMeetings(events);
          } else {
            // Fetch calendar events from Google Calendar if no cache
            events = await fetchCalendarEvents();
            console.log("Fetched events from API:", events);
            setUpcomingMeetings(events);
            
            // Store events in local storage
            localStorage.setItem('calendarEvents', JSON.stringify(events));
          }
        } catch (storageErr) {
          console.error('Error accessing localStorage:', storageErr);
          // Fetch from API if localStorage fails
          events = await fetchCalendarEvents();
          setUpcomingMeetings(events);
        }
        
        // Get AI-generated daily summary
        if (events.length > 0) {
          const aiSummary = await getDailySummary(events);
          setSummary(aiSummary);
        } else {
          setSummary('');
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load your meetings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Add event listener to refresh dashboard when localStorage changes
    const handleStorageChange = (e) => {
      if (e.key === 'calendarEvents') {
        console.log('Calendar events updated in localStorage, refreshing dashboard');
        loadDashboardData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      
      // Fetch calendar events from Google Calendar
      const events = await fetchCalendarEvents();
      setUpcomingMeetings(events);
      
      // Update local storage with fresh data
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(events));
      } catch (storageErr) {
        console.error('Error updating localStorage:', storageErr);
      }
      
      // Get AI-generated daily summary
      if (events.length > 0) {
        const aiSummary = await getDailySummary(events);
        setSummary(aiSummary);
      }
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh your meetings. Please try again later.');
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Get current time in hours (0-23)
  const getCurrentHour = () => {
    return new Date().getHours();
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = getCurrentHour();
    
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const handleDeleteClick = (meeting) => {
    setMeetingToDelete(meeting);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!meetingToDelete) return;
    
    // First, update UI by removing the meeting from state
    const filteredMeetings = upcomingMeetings.filter(
      meeting => meeting.id !== meetingToDelete.id
    );
    setUpcomingMeetings(filteredMeetings);
    
    // Then, try to update local storage
    try {
      // Get current data from localStorage to ensure we're not overwriting other changes
      const currentStoredData = localStorage.getItem('calendarEvents');
      
      // If we have stored data, filter out the meeting to delete
      if (currentStoredData) {
        const storedMeetings = JSON.parse(currentStoredData).filter(
          meeting => meeting.id !== meetingToDelete.id
        );
        localStorage.setItem('calendarEvents', JSON.stringify(storedMeetings));
      } else {
        // If no stored data, just save the filtered meetings
        localStorage.setItem('calendarEvents', JSON.stringify(filteredMeetings));
      }
      
      console.log('Meeting deleted from localStorage:', meetingToDelete.id);
    } catch (storageErr) {
      console.error('Error updating localStorage after delete:', storageErr);
      setError('Failed to update storage. Changes may not persist after reload.');
    }
    
    // If there are no meetings left, update the summary
    if (filteredMeetings.length === 0) {
      setSummary('');
    }
    
    // Reset the UI state
    setDeleteDialogOpen(false);
    setMeetingToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setMeetingToDelete(null);
  };

  if (loading) {
    return (
      <Box className="loading-container" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <CalendarMonth sx={{ fontSize: 60, color: theme.palette.primary.main, mb: 2 }} />
        </motion.div>
        <Typography variant="h5" sx={{ mb: 2 }}>Loading your schedule...</Typography>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Dashboard Header */}
        <motion.div variants={itemVariants}>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={4}
            sx={{ 
              pb: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`
            }}
          >
            <Box>
              <Typography 
                variant="h3" 
                component="h1" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1 
                }}
              >
                <span className="calendar-icon" style={{ display: 'inline-block' }}>📅</span> {getGreeting()}, {currentUser?.displayName?.split(' ')[0] || 'User'}
              </Typography>
              <Typography 
                variant="subtitle1" 
                color="textSecondary"
              >
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <Tooltip title="Refresh dashboard">
                <IconButton 
                  color="primary" 
                  onClick={refreshDashboard} 
                  disabled={refreshing}
                  sx={{ mr: 2 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/schedule')}
                sx={{ 
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  boxShadow: '0 4px 14px 0 rgba(37, 99, 235, 0.25)'
                }}
              >
                Schedule Meeting
              </Button>
            </Box>
          </Box>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '12px'
              }}
              action={
                <Button color="inherit" size="small" onClick={refreshDashboard}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </motion.div>
        )}

        <Grid container spacing={4}>
          {/* Daily Summary Card */}
          <Grid item xs={12} lg={4}>
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -5 }}
            >
              <Paper 
                elevation={3}
                sx={{ 
                  p: 0,
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: '16px',
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                  color: 'white',
                  position: 'relative'
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    top: '-30px',
                    right: '-20px',
                    opacity: 0.2,
                    transform: 'rotate(15deg)'
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 150 }} />
                </Box>
                <CardHeader 
                  title={
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: 'white' }}>
                      Your Day at a Glance
                    </Typography>
                  }
                  avatar={
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                    >
                      <AlarmIcon />
                    </Avatar>
                  }
                />
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                <CardContent sx={{ pt: 3, pb: 4, px: 3 }}>
                  {summary ? (
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>{summary}</Typography>
                  ) : (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      No meetings scheduled for today. Enjoy your free time!
                    </Typography>
                  )}
                </CardContent>
              </Paper>
            </motion.div>
          </Grid>

          {/* Upcoming Meetings */}
          <Grid item xs={12} lg={8}>
            <motion.div variants={itemVariants}>
              <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={2}
              >
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Upcoming Meetings
                </Typography>
                <Chip 
                  label={`${upcomingMeetings.length} Events`} 
                  color="primary" 
                  variant="outlined" 
                  icon={<CalendarToday fontSize="small" />}
                  sx={{ fontWeight: 500 }}
                />
              </Box>
            </motion.div>
            
            {upcomingMeetings.length === 0 ? (
              <motion.div variants={itemVariants}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 5, 
                    textAlign: 'center',
                    borderRadius: '16px',
                    backgroundColor: theme.palette.background.paper,
                    border: `1px dashed ${theme.palette.divider}`
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3
                    }}
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        scale: [1, 1.05, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        repeatType: "loop"
                      }}
                    >
                      <EventIcon 
                        sx={{ 
                          fontSize: 60,
                          color: theme.palette.text.secondary,
                          opacity: 0.5
                        }} 
                      />
                    </motion.div>
                  </Box>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    No upcoming meetings scheduled
                  </Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    Use the "Schedule Meeting" button to create your first AI-powered meeting
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/schedule')}
                    sx={{ mt: 2 }}
                  >
                    Create Meeting
                  </Button>
                </Paper>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants}>
                {upcomingMeetings.map((meeting, index) => (
                  <motion.div 
                    key={meeting.id} 
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { 
                        delay: index * 0.1,
                        duration: 0.4
                      }
                    }}
                  >
                    <Card 
                      sx={{ 
                        mb: 3,
                        borderRadius: '16px',
                        overflow: 'visible'
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        <Grid container>
                          {/* Time indicator */}
                          <Grid 
                            item 
                            xs={12} 
                            sm={3} 
                            md={2}
                            sx={{ 
                              p: 3,
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center',
                              borderRight: `1px solid ${theme.palette.divider}`,
                              backgroundColor: theme.palette.background.default,
                              borderRadius: '16px 0 0 16px'
                            }}
                          >
                            <Typography 
                              variant="h6" 
                              align="center" 
                              sx={{ 
                                fontWeight: 700,
                                fontSize: '1.5rem',
                                color: theme.palette.primary.main
                              }}
                            >
                              {meeting.start.dateTime ? formatTime(meeting.start.dateTime) : 'All Day'}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              align="center" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                fontWeight: 500
                              }}
                            >
                              {formatDate(meeting.start.dateTime || meeting.start.date)}
                            </Typography>
                          </Grid>
                          
                          {/* Meeting details */}
                          <Grid item xs={12} sm={9} md={10} sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box flex={1}>
                                <Typography 
                                  variant="h6" 
                                  gutterBottom
                                  sx={{ 
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                  }}
                                >
                                  {meeting.summary}
                                  {meeting.organizer?.self && (
                                    <Chip
                                      label="Organized by you"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ ml: 1, fontWeight: 500 }}
                                    />
                                  )}
                                </Typography>
                                
                                <Grid container spacing={2} sx={{ mt: 1 }}>
                                  <Grid item xs={12} md={6}>
                                    <Box display="flex" alignItems="center" mb={1.5}>
                                      <AccessTimeIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                      <Typography variant="body2">
                                        {meeting.start.dateTime ? (
                                          <>
                                            {formatTime(meeting.start.dateTime)} - {formatTime(meeting.end.dateTime)}
                                          </>
                                        ) : (
                                          'All day'
                                        )}
                                      </Typography>
                                    </Box>
                                    
                                    {meeting.location && (
                                      <Box display="flex" alignItems="center" mb={1.5}>
                                        <RoomIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                                        <Typography variant="body2">{meeting.location}</Typography>
                                      </Box>
                                    )}
                                    
                                    {meeting.attendees && meeting.attendees.length > 0 && (
                                      <Box display="flex" alignItems="flex-start" mb={1.5}>
                                        <PeopleIcon color="action" sx={{ mr: 1, mt: 0.5, fontSize: 20 }} />
                                        <Box>
                                          <Typography variant="body2" gutterBottom>
                                            {meeting.attendees.length} Attendee{meeting.attendees.length !== 1 ? 's' : ''}
                                          </Typography>
                                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                                            {meeting.attendees.slice(0, 3).map((attendee, index) => (
                                              <Chip 
                                                key={index} 
                                                label={attendee.email} 
                                                size="small" 
                                                variant="outlined"
                                                sx={{ 
                                                  borderRadius: '4px',
                                                  backgroundColor: theme.palette.background.default
                                                }}
                                              />
                                            ))}
                                            {meeting.attendees.length > 3 && (
                                              <Chip 
                                                label={`+${meeting.attendees.length - 3} more`} 
                                                size="small" 
                                                variant="outlined"
                                                sx={{ 
                                                  borderRadius: '4px',
                                                  backgroundColor: theme.palette.background.default
                                                }}
                                              />
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Grid>
                                  
                                  <Grid item xs={12} md={6}>
                                    {meeting.description && (
                                      <Box>
                                        <Typography variant="body2" color="textSecondary" gutterBottom>
                                          Description:
                                        </Typography>
                                        <Typography 
                                          variant="body2"
                                          sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                          }}
                                        >
                                          {meeting.description}
                                        </Typography>
                                      </Box>
                                    )}
                                  </Grid>
                                </Grid>
                              </Box>
                              
                              {/* Action buttons */}
                              <Box ml={2} mt={1} display="flex">
                                {/* Delete button */}
                                <Tooltip title="Delete meeting">
                                  <IconButton 
                                    color="error"
                                    onClick={() => handleDeleteClick(meeting)}
                                    sx={{ mr: 1 }}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </Tooltip>
                                
                                {/* Existing view details button */}
                                <Tooltip title="View details">
                                  <IconButton 
                                    color="primary"
                                    component={meeting.hangoutLink ? "a" : "button"}
                                    href={meeting.hangoutLink}
                                    target={meeting.hangoutLink ? "_blank" : undefined}
                                  >
                                    <ArrowForwardIcon />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Grid>
        </Grid>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>
          Delete Meeting
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the meeting "{meetingToDelete?.summary}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Dashboard;
