import React, { useState } from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Avatar, 
  Divider, 
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  TextField,
  Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { updateUserPreferences } from '../services/userService';

function Profile() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  // User preferences
  const [preferences, setPreferences] = useState({
    autoSchedule: true,
    dailySummary: true,
    summaryTime: '18:00',
    workStartTime: '09:00',
    workEndTime: '17:00',
    lunchTime: '12:00',
    lunchDuration: 60,
    importantContacts: ''
  });

  const handlePreferenceChange = (event) => {
    const { name, value, checked } = event.target;
    setPreferences({
      ...preferences,
      [name]: event.target.type === 'checkbox' ? checked : value
    });
  };

  const savePreferences = async () => {
    setLoading(true);
    setSuccess('');
    setError('');
    
    try {
      await updateUserPreferences(preferences);
      setSuccess('Preferences saved successfully!');
    } catch (err) {
      console.error('Error saving preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Typography variant="h4" component="h1" gutterBottom>
        User Profile
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar 
                src={currentUser?.photoURL}
                alt={currentUser?.displayName || "User"}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              
              <Typography variant="h5" gutterBottom>
                {currentUser?.displayName || "User"}
              </Typography>
              
              <Typography variant="body1" color="textSecondary" gutterBottom>
                {currentUser?.email}
              </Typography>
              
              <Box mt={2} width="100%">
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem>
                    <ListItemText 
                      primary="Account Type" 
                      secondary="Google Account" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Calendar Connected" 
                      secondary="Yes" 
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Scheduling Preferences
            </Typography>
            
            <List
              subheader={
                <ListSubheader component="div">
                  AI Scheduling
                </ListSubheader>
              }
            >
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.autoSchedule}
                      onChange={handlePreferenceChange}
                      name="autoSchedule"
                      color="primary"
                    />
                  }
                  label="Enable AI to automatically schedule meetings"
                />
              </ListItem>
              
              <ListItem>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.dailySummary}
                      onChange={handlePreferenceChange}
                      name="dailySummary"
                      color="primary"
                    />
                  }
                  label="Receive daily meeting summaries"
                />
              </ListItem>
              
              <ListItem>
                <TextField
                  label="Daily Summary Time"
                  type="time"
                  name="summaryTime"
                  value={preferences.summaryTime}
                  onChange={handlePreferenceChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 min
                  }}
                  disabled={!preferences.dailySummary}
                  sx={{ width: 150 }}
                />
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <List
              subheader={
                <ListSubheader component="div">
                  Work Hours
                </ListSubheader>
              }
            >
              <ListItem>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Work Start Time"
                      type="time"
                      name="workStartTime"
                      value={preferences.workStartTime}
                      onChange={handlePreferenceChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Work End Time"
                      type="time"
                      name="workEndTime"
                      value={preferences.workEndTime}
                      onChange={handlePreferenceChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </ListItem>
              
              <ListItem>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Lunch Time"
                      type="time"
                      name="lunchTime"
                      value={preferences.lunchTime}
                      onChange={handlePreferenceChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Lunch Duration (minutes)"
                      type="number"
                      name="lunchDuration"
                      value={preferences.lunchDuration}
                      onChange={handlePreferenceChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        min: 0,
                        max: 120,
                      }}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </ListItem>
            </List>
            
            <Divider sx={{ my: 2 }} />
            
            <List
              subheader={
                <ListSubheader component="div">
                  Priority Contacts
                </ListSubheader>
              }
            >
              <ListItem>
                <TextField
                  label="Important Contacts (comma-separated emails)"
                  name="importantContacts"
                  value={preferences.importantContacts}
                  onChange={handlePreferenceChange}
                  helperText="Meetings with these contacts will be prioritized"
                  multiline
                  rows={2}
                  fullWidth
                />
              </ListItem>
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={savePreferences}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Preferences'}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default Profile;
