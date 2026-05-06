import { Box, Container, Grid, Typography, IconButton, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();

  const footerLinks = {
    shop: [
      { label: 'All Products', path: '/products' },
      { label: 'Fruits & Vegetables', path: '/products?category=fruits-vegetables' },
      { label: 'Rice & Pulses', path: '/products?category=rice-pulses' },
    ],
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact', path: '/contact' },
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
    ],
    support: [
      { label: 'Help Center', path: '/contact' },
      { label: 'Delivery Info', path: '/delivery' },
      { label: 'Returns', path: '/returns' },
    ],
  };

  return (
    <Box component="footer" sx={{ bgcolor: '#14532d', color: 'white', pt: 8, pb: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Box component="img" src="/logo.png" alt="JJAZ MART" sx={{ height: 32, width: 'auto', filter: 'brightness(0) invert(1)', borderRadius: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', display: { xs: 'none', md: 'block' } }}>
                JJAZ MART
              </Typography>
            </Box>
            <Typography variant="body2" color="grey.400" sx={{ mb: 3, maxWidth: 300 }}>
              Your one-stop destination for quality products at amazing prices.
              Shop with confidence.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Shop
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'grey.400',
                    textAlign: 'left',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Company
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'grey.400',
                    textAlign: 'left',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {footerLinks.support.map((link) => (
                <Link
                  key={link.path}
                  component="button"
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: 'grey.400',
                    textAlign: 'left',
                    textDecoration: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { color: 'white' },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ borderTop: '1px solid #334155', mt: 6, pt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="grey.500">
            © {new Date().getFullYear()} JJAZ MALL. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;