import { useState } from 'react';
import { Box, Container, Typography, Grid, Card, TextField, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const ContactPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const contactInfo = [
    { icon: <PhoneIcon />, label: 'Phone', value: '+91 1234567890', desc: 'Mon-Sat, 9AM-6PM' },
    { icon: <EmailIcon />, label: 'Email', value: 'support@jjazmall.com', desc: 'We reply within 24 hours' },
    { icon: <LocationOnIcon />, label: 'Address', value: 'Mumbai, India', desc: 'Office hours: Mon-Fri' },
  ];

  const social = [
    { icon: <FacebookIcon />, label: 'Facebook', link: '#' },
    { icon: <TwitterIcon />, label: 'Twitter', link: '#' },
    { icon: <InstagramIcon />, label: 'Instagram', link: '#' },
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>Contact Us</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center' }}>
            Have questions? We'd love to hear from you.
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Card sx={{ p: 4, height: '100%' }}>
                <Typography variant="h5" sx={{ mb: 3 }}>Get in Touch</Typography>
                <List>
                  {contactInfo.map((item, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ color: 'primary.main' }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.value}
                        secondary={
                          <>
                            <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>Follow Us</Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  {social.map((item, i) => (
                    <Button key={i} variant="outlined" startIcon={item.icon} href={item.link}>
                      {item.label}
                    </Button>
                  ))}
                </Box>
              </Card>
            </Grid>

            <Grid item xs={12} md={7}>
              <Card sx={{ p: 4 }}>
                <Typography variant="h5" sx={{ mb: 3 }}>Send us a Message</Typography>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Message" multiline rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" size="large" startIcon={<SendIcon />} disabled={isSubmitting}>
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default ContactPage;