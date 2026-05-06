import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Avatar, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import StorefrontIcon from '@mui/icons-material/Storefront';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AboutPage = () => {
  const navigate = useNavigate();

  const stats = [
    { icon: <TrendingUpIcon />, value: '50K+', label: 'Orders Delivered' },
    { icon: <PeopleIcon />, value: '25K+', label: 'Happy Customers' },
    { icon: <StorefrontIcon />, value: '1000+', label: 'Products' },
    { icon: <StarIcon />, value: '4.8/5', label: 'Average Rating' },
  ];

  const team = [
    { name: 'Team Lead', role: 'Leadership', desc: 'Experienced e-commerce professional' },
    { name: 'Tech Lead', role: 'Technology', desc: 'Full-stack development expert' },
    { name: 'Marketing', role: 'Growth', desc: 'Digital marketing specialist' },
  ];

  const values = [
    { title: 'Quality First', desc: 'We never compromise on product quality' },
    { title: 'Customer Centric', desc: 'Your satisfaction is our priority' },
    { title: 'Transparency', desc: 'Clear and honest communication' },
    { title: 'Continuous Innovation', desc: 'Always improving our services' },
  ];

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
      <Container maxWidth="lg">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Hero */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>About JJAZ MALL</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              JJAZ MALL is your trusted online destination for quality products at great prices.
              We're committed to providing the best shopping experience for customers across India.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" onClick={() => navigate('/products')}>Shop Now</Button>
              <Button variant="outlined" onClick={() => navigate('/contact')}>Contact Us</Button>
            </Box>
          </Box>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {stats.map((stat, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ p: 3, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>{stat.icon}</Box>
                  <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Our Story */}
          <Card sx={{ p: 4, mb: 8 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Our Story</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Founded in 2020, JJAZ MALL started with a simple mission: to make quality products accessible to everyone.
              What began as a small online store has grown into a trusted shopping destination serving thousands of customers.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We believe in providing authentic products, transparent pricing, and exceptional customer service.
              Every order is handled with care, and every customer is treated like family.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Today, we continue to expand our product range while staying true to our core values of quality, honesty, and customer satisfaction.
            </Typography>
          </Card>

          {/* Values */}
          <Typography variant="h4" sx={{ mb: 3 }}>Our Values</Typography>
          <Grid container spacing={3} sx={{ mb: 8 }}>
            {values.map((value, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Card sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>{value.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{value.desc}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* CTA */}
          <Card sx={{ p: 4, textAlign: 'center', bgcolor: '#0f172a' }}>
            <Typography variant="h4" sx={{ color: 'white', mb: 2 }}>Ready to Shop?</Typography>
            <Typography variant="body2" sx={{ color: 'grey.400', mb: 3 }}>
              Join thousands of happy customers and discover amazing deals
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default AboutPage;