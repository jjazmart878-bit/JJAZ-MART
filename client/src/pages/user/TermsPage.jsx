import { Box, Container, Typography, Grid, Card, List, ListItem, ListItemIcon, ListItemText, Button, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReplayIcon from '@mui/icons-material/Replay';
import PaymentIcon from '@mui/icons-material/Payment';
import SupportIcon from '@mui/icons-material/Support';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>Terms & Conditions</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              Please read these terms carefully before using our website.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {[
              { icon: <LocalShippingIcon />, title: 'Shipping Policy', desc: 'Free shipping on orders above ₹500. Delivery within 30 minutes.' },
              { icon: <ReplayIcon />, title: 'Return Policy', desc: '30-day return policy for most items._items must be unused and in original packaging.' },
              { icon: <PaymentIcon />, title: 'Payment Methods', desc: 'Accept all major credit/debit cards, UPI, and Cash on Delivery.' },
              { icon: <SupportIcon />, title: 'Customer Support', desc: '24/7 customer support via chat, email, and phone.' },
            ].map((item, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Box sx={{ color: 'primary.main', mb: 2, display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card sx={{ p: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Terms of Use</Typography>
            <List>
              {[
                'By using this website, you agree to our terms and conditions',
                'All products are for personal/non-commercial use only',
                'Prices and availability are subject to change without notice',
                'We reserve the right to cancel any order',
                'Intellectual property rights are reserved',
                'User accounts must be kept confidential',
              ].map((term, i) => (
                <ListItem key={i} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><CheckCircleIcon color="primary" /></ListItemIcon>
                  <ListItemText primary={term} />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Order Cancellations</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              You can cancel your order within 24 hours of placing it, provided it has not been shipped yet. To cancel:
            </Typography>
            <List>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}><InfoIcon /></ListItemIcon>
                <ListItemText primary="Contact us via phone or email with your order number" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 40 }}><InfoIcon /></ListItemIcon>
                <ListItemText primary="Refunds will be processed within 5-7 business days" />
              </ListItem>
            </List>
          </Card>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Last updated: {new Date().toLocaleDateString()}</Typography>
            <Typography
              variant="body2"
              sx={{ cursor: 'pointer', color: 'primary.main' }}
              onClick={() => navigate('/privacy')}
            >
              View Privacy Policy
            </Typography>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default TermsPage;