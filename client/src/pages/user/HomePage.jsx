import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, Card, CardMedia, CardContent, Link, Chip, Skeleton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import VerifiedIcon from '@mui/icons-material/Verified';
import ReplayIcon from '@mui/icons-material/Replay';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsAPI, categoriesAPI } from '../../api';
import { ProductGrid } from '../../components/common/ProductGrid';
import { ProductGridSkeleton } from '../../components/common/Skeleton';

const HomePage = () => {
  const navigate = useNavigate();

  const slides = [
    {
      title: 'Fresh Groceries Delivered',
      subtitle: 'Up to 30% Off',
      description: 'Get fresh fruits, vegetables, and daily essentials delivered to your doorstep. Pure quality, best prices!',
      cta: 'Shop Now',
      ctaLink: '/products',
      bg: 'https://images.unsplash.com/photo-1542838132-92c533ef91dd?w=1920',
      mainProduct: { img: '/milk.png', alt: 'Fresh Milk', w: { xs: 0, md: 400 }, h: { xs: 0, md: 450 }, bottom: '5%', right: '5%', z: 10 },
      floatProducts: [],
    },
    {
      title: 'Dal & Rice Mega Sale',
      subtitle: 'Flat 25% Off',
      description: 'Rice, dal, oils, spices and all your kitchen staples at unbeatable prices. Stock up now!',
      cta: 'Grab Deal',
      ctaLink: '/products',
      bg: 'https://images.unsplash.com/photo-1604719312566-b8919162a559?w=1920',
      mainProduct: { img: '/toor daal.png', alt: 'Toor Dal', w: { xs: 0, md: 400 }, h: { xs: 0, md: 450 }, bottom: '5%', right: '5%', z: 10 },
      floatProducts: [],
    },
    {
      title: 'Spices & Flavors',
      subtitle: 'Up to 35% Off',
      description: 'Premium spices to make your food delicious. Get chili powder, turmeric and more at great prices!',
      cta: 'Explore Spices',
      ctaLink: '/products',
      bg: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1920',
      mainProduct: { img: '/chilli.png', alt: 'Chilli Powder', w: { xs: 0, md: 380 }, h: { xs: 0, md: 420 }, bottom: '5%', right: '5%', z: 10 },
      floatProducts: [],
    },
    {
      title: 'Farm Fresh Produce',
      subtitle: 'Daily Fresh',
      description: 'Direct from farms to your kitchen. Fresh fruits & vegetables at JJAZ MART prices you trust!',
      cta: 'Explore Fresh',
      ctaLink: '/products',
      bg: 'https://images.unsplash.com/photo-1610832958506-aa5625379600?w=1920',
      mainProduct: { img: '/egg.png', alt: 'Farm Fresh Eggs', w: { xs: 0, md: 380 }, h: { xs: 0, md: 420 }, bottom: '5%', right: '5%', z: 10 },
      floatProducts: [],
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => setCurrentSlide(p => (p + 1) % slides.length), 300);
      setTimeout(() => setIsAnimating(false), 600);
    }, 4000);
    return () => clearInterval(t);
  }, [slides.length]);

  const { data: fd, isLoading: fdLoading } = useQuery({ queryKey: ['fp'], queryFn: () => productsAPI.getFeatured(8) });
  const { data: cd, isLoading: cdLoading } = useQuery({ queryKey: ['c'], queryFn: () => categoriesAPI.getAll() });
  const { data: ld, isLoading: ldLoading } = useQuery({ queryKey: ['lp'], queryFn: () => productsAPI.getAll({ page: 1, limit: 4 }) });

  const fp = fd?.data || fd || [];
  const c = cd?.data || cd || [];
  const lp = ld?.products || ld?.data?.products || [];

  const currentSlideData = slides[currentSlide];
  const mainProduct = currentSlideData.mainProduct;
  const floatProducts = currentSlideData.floatProducts;

  return (
    <Box>
      {/* Hero Slider */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Box sx={{ position: 'relative', borderRadius: { xs: 2, md: 4 }, height: { xs: 340, sm: 400, md: 500 }, overflow: 'hidden' }}>
          {/* Background */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #166534 0%, #14532d 100%)' }} />
          
          {/* Content - Desktop: Left aligned, Mobile: Centered */}
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: { xs: 'center', md: 'flex-start' }, px: { xs: 2, sm: 4, md: 8 } }}>
            <Box sx={{ maxWidth: { xs: '90%', md: 500 }, textAlign: { xs: 'center', md: 'left' }, zIndex: 20 }}>
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 1, fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2.5rem' } }}>
                {currentSlideData.title}
              </Typography>
              <Typography variant="h4" sx={{ color: '#4ade80', fontWeight: 600, mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                {currentSlideData.subtitle}
              </Typography>
              <Typography variant="body1" sx={{ color: '#bbf7d0', mb: 3, fontSize: { xs: '0.8rem', sm: '0.85rem', md: '1rem' }, display: 'block', maxWidth: { xs: '100%', md: 400 } }}>
                {currentSlideData.description}
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate(currentSlideData.ctaLink)}
                sx={{ 
                  bgcolor: '#22c55e', 
                  '&:hover': { bgcolor: '#16a34a' },
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.9rem' }
                }}
              >
                {currentSlideData.cta}
              </Button>
            </Box>
          </Box>

          {/* Product Image - Desktop Only */}
          <Box sx={{ position: 'absolute', bottom: { xs: 'auto', md: '5%' }, right: { xs: 'auto', md: '5%' }, display: { xs: 'none', md: 'block' }, zIndex: mainProduct.z }}>
            <Box component="img" src={mainProduct.img} alt={mainProduct.alt} sx={{ width: mainProduct.w.md, height: mainProduct.h.md, objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))' }} />
          </Box>

          {/* Slide Indicators */}
          <Box sx={{ position: 'absolute', bottom: { xs: 10, md: 16 }, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1 }}>
            {slides.map((_, i) => (
              <Box key={i} onClick={() => setCurrentSlide(i)} sx={{ width: { xs: 6, md: 8 }, height: { xs: 6, md: 8 }, borderRadius: '50%', bgcolor: currentSlide === i ? '#22c55e' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'all 0.3s' }} />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Features - Green Theme */}
      <Box sx={{ bgcolor: 'white', py: { xs: 3, md: 4 }, borderBottom: '1px solid #f0f0f0' }}>
        <Container maxWidth="xl">
          <Grid container spacing={2}>
            {[{ t: 'Free Delivery', d: 'Orders above ₹299', i: <LocalShippingIcon /> }, { t: 'Fresh Quality', d: 'Direct from farms', i: <VerifiedIcon /> }, { t: 'Easy Returns', d: 'Within 24 hours', i: <ReplayIcon /> }, { t: '24/7 Support', d: 'Always here for you', i: <SupportAgentIcon /> }].map((f, i) => (
              <Grid item xs={6} md={3} key={i}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: '#22c55e', p: 0.75, bgcolor: 'rgba(34,197,94,0.1)', borderRadius: 2 }}>{f.i}</Box>
                  <Box><Typography variant="body2" fontWeight={600} color="#111">{f.t}</Typography><Typography variant="caption" color="text.secondary">{f.d}</Typography></Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography variant="h5" fontWeight={700} color="#111">Shop by Category</Typography>
          <Link onClick={() => navigate('/products')} sx={{ color: '#22c55e', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}>View All <ArrowForwardIcon fontSize="small" /></Link>
        </Box>
        {cdLoading ? (
          <Box sx={{ display: 'flex', gap: 2, overflow: 'hidden' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Box key={i} sx={{ minWidth: 100, p: 2, textAlign: 'center' }}>
                <Skeleton variant="circular" width={48} height={48} sx={{ mx: 'auto', mb: 1, bgcolor: '#e0e0e0' }} />
                <Skeleton variant="text" width="80%" height={16} sx={{ mx: 'auto', bgcolor: '#e0e0e0' }} />
              </Box>
            ))}
          </Box>
        ) : (
        <Grid container spacing={2}>
          {(c && c.length > 0 ? c : []).slice(0, 8).map((cat) => (
            <Grid item xs={4} sm={3} md={2} key={cat.id || Math.random()}>
              <Card onClick={() => navigate(`/products?category=${cat.slug}`)} 
                sx={{ 
                  p: { xs: 1.5, md: 2 }, 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: '1px solid #f0f0f0',
                  boxShadow: 'none',
                  transition: 'all 0.25s ease',
                  '&:hover': { 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    borderColor: '#22c55e'
                  } 
                }}>
                <Box sx={{ width: { xs: 48, md: 60 }, height: { xs: 48, md: 60 }, borderRadius: 2, mb: 1, mx: 'auto', overflow: 'hidden', bgcolor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cat.image_url ? (
                    <Box component="img" src={cat.image_url} alt={cat.name} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : cat.icon ? (
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 600 }}>{cat.icon}</Typography>
                  ) : (
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>{cat.name ? cat.name.charAt(0) : '?'}</Typography>
                  )}
                </Box>
                <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' }}}>{cat.name || 'Category'}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
        )}
      </Container>

      {/* Deals - Grocery */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 } }}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="#111">Best Deals</Typography>
              <Typography variant="body2" color="text.secondary">Grab today's top offers</Typography>
            </Box>
            <Button onClick={() => navigate('/products')} sx={{ color: '#22c55e', fontWeight: 500 }}>View All</Button>
          </Box>
          {ldLoading ? (
            <Grid container spacing={2}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={6} sm={3} key={i}>
                  <Box sx={{ bgcolor: 'white', borderRadius: 3, overflow: 'hidden' }}>
                    <Skeleton variant="rectangular" height={180} />
                    <Box sx={{ p: 2 }}>
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="60%" sx={{ mt: 1 }} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
          <ProductGrid products={Array.isArray(lp) ? lp : []} columns={{ xs: 6, sm: 3, md: 3 }} />
        )}
        </Container>
      </Box>

      {/* Popular Products */}
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 } }}>
          <Typography variant="h5" fontWeight={700} color="#111">Popular Products</Typography>
          <Button onClick={() => navigate('/products')} sx={{ color: '#22c55e', fontWeight: 500 }}>View All</Button>
        </Box>
        {fdLoading ? <ProductGridSkeleton count={4} /> : <ProductGrid products={Array.isArray(fp) ? fp : []} columns={{ xs: 6, sm: 3, md: 3 }} />}
      </Container>

      {/* Latest */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 4, md: 6 } }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 3, md: 4 } }}>
            <Typography variant="h5" fontWeight={700} color="#111">New Arrivals</Typography>
            <Button onClick={() => navigate('/products')} sx={{ color: '#22c55e', fontWeight: 500 }}>View All</Button>
          </Box>
          {ldLoading ? <ProductGridSkeleton count={4} /> : <ProductGrid products={Array.isArray(lp) ? lp : []} columns={{ xs: 6, sm: 3, md: 3 }} />}
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;