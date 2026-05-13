import { useState } from 'react';
import { Box, Container, Typography, Grid, Button, IconButton, Divider, Card, Chip, useMediaQuery, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../../store/cartStore';
import { productsAPI } from '../../api';
import ProductGrid from '../../components/common/ProductGrid';
import { ProductGridSkeleton } from '../../components/common/Skeleton';

const CartPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { items, removeItem, updateQuantity } = useCartStore();
  const [recommendationsOpen, setRecommendationsOpen] = useState(true);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const { data: recommendationsData, isLoading: recLoading } = useQuery({
    queryKey: ['products', { limit: 8 }],
    queryFn: () => productsAPI.getAll({ limit: 8 }),
  });

  const recommendations = recommendationsData?.data?.products?.filter(
    p => !items.some(item => item.id === p.id)
  ).slice(0, 4) || [];

  if (items.length === 0) {
    return (
      <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: { xs: 4, md: 8 } }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center', py: { xs: 6, md: 10 } }}>
            <Box sx={{ 
              width: { xs: 100, md: 120 }, 
              height: { xs: 100, md: 120 }, 
              borderRadius: '50%', 
              bgcolor: '#f0fdf4', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}>
              <ShoppingCartIcon sx={{ fontSize: { xs: 48, md: 60 }, color: '#22c55e' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 1.5, fontWeight: 600, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
              Your cart is empty
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Looks like you haven't added anything to your cart yet.
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/products')}
              startIcon={<ShoppingCartIcon />}
              sx={{ 
                bgcolor: '#22c55e', 
                '&:hover': { bgcolor: '#16a34a' },
                px: 4,
                py: 1.5,
                borderRadius: 3,
              }}
            >
              Start Shopping
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', pb: { xs: 12, md: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1, md: 3 }, py: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
            My Cart ({itemCount})
          </Typography>
        </Box>

        {/* Delivery Status Banner */}
        <Card sx={{ 
          mb: 3, 
          p: { xs: 2, md: 2.5 }, 
          borderRadius: 3, 
          bgcolor: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
          color: 'white',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                width: { xs: 48, md: 56 }, 
                height: { xs: 48, md: 56 }, 
                borderRadius: '50%', 
                bgcolor: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <LocalShippingIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: '1rem', md: '1.1rem' }, mb: 0.25 }}>
                  Delivery in 30 minutes
                </Typography>
                <Typography sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, opacity: 0.9 }}>
                  Shipment of {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              px: 2,
              py: 1,
              bgcolor: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
            }}>
              <AccessTimeIcon sx={{ fontSize: 18 }} />
              <Typography sx={{ fontWeight: 600, fontSize: '0.85rem' }}>30 min</Typography>
            </Box>
          </Box>
        </Card>

        <Grid container spacing={3}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card sx={{ 
                      p: { xs: 1.5, md: 2 }, 
                      borderRadius: 3,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
                    }}>
                      <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'center' }}>
                        {/* Product Image */}
                        <Box
                          onClick={() => navigate(`/products/${item.slug}`)}
                          sx={{
                            width: { xs: 80, md: 100 },
                            height: { xs: 80, md: 100 },
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            flexShrink: 0,
                            bgcolor: '#f5f5f5',
                          }}
                        >
                          {item.images?.[0] ? (
                            <Box
                              component="img"
                              src={item.images[0]}
                              alt={item.title}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ 
                              width: '100%', 
                              height: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              bgcolor: '#f0fdf4',
                            }}>
                              <ShoppingCartIcon sx={{ color: '#22c55e', fontSize: 32 }} />
                            </Box>
                          )}
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                onClick={() => navigate(`/products/${item.slug}`)}
                                sx={{ 
                                  fontWeight: 600, 
                                  fontSize: { xs: '0.85rem', md: '0.95rem' },
                                  cursor: 'pointer',
                                  mb: 0.25,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}>
                                {item.category_name || 'General'}
                              </Typography>
                            </Box>
                            <IconButton 
                              size="small" 
                              onClick={() => removeItem(item.id)}
                              sx={{ 
                                color: 'grey.400',
                                '&:hover': { color: 'error.main', bgcolor: 'error.light' },
                              }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </IconButton>
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: { xs: 1, md: 1.5 } }}>
                            {/* Quantity Selector */}
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              bgcolor: '#f5f5f5',
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}>
                              <IconButton 
                                size="small"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                sx={{ 
                                  borderRadius: 0,
                                  width: { xs: 28, md: 32 },
                                  height: { xs: 28, md: 32 },
                                  '&:hover': { bgcolor: '#e5e7eb' },
                                }}
                              >
                                <RemoveIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                              </IconButton>
                              <Typography sx={{ 
                                minWidth: { xs: 28, md: 32 }, 
                                textAlign: 'center', 
                                fontWeight: 600,
                                fontSize: { xs: '0.85rem', md: '0.9rem' },
                              }}>
                                {item.quantity}
                              </Typography>
                              <IconButton 
                                size="small"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                sx={{ 
                                  borderRadius: 0,
                                  width: { xs: 28, md: 32 },
                                  height: { xs: 28, md: 32 },
                                  '&:hover': { bgcolor: '#e5e7eb' },
                                }}
                              >
                                <AddIcon sx={{ fontSize: { xs: 14, md: 16 } }} />
                              </IconButton>
                            </Box>

                            {/* Price */}
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography sx={{ 
                                fontWeight: 700, 
                                fontSize: { xs: '0.9rem', md: '1rem' },
                                color: '#22c55e',
                              }}>
                                ₹{Number(item.price * item.quantity).toLocaleString()}
                              </Typography>
                              {item.quantity > 1 && (
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', md: '0.7rem' } }}>
                                  ₹{Number(item.price).toLocaleString()} each
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Box>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Box 
                  onClick={() => setRecommendationsOpen(!recommendationsOpen)}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 2,
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlashOnIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
                      You might also like
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${recommendations.length} items`} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#fef3c7', 
                      color: '#f59e0b',
                      fontSize: '0.7rem',
                    }}
                  />
                </Box>
                {recommendationsOpen && (
                  <ProductGrid products={recommendations} loading={recLoading} />
                )}
              </Box>
            )}
          </Grid>

          {/* Order Summary - Desktop Only */}
          {!isMobile && (
            <Grid item md={4}>
              <Card sx={{ 
                p: 3, 
                borderRadius: 3, 
                position: 'sticky', 
                top: 80,
              }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2.5, fontSize: '1rem' }}>
                  Order Summary
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>Subtotal ({itemCount} items)</Typography>
                  <Typography sx={{ fontSize: '0.9rem' }}>₹{total.toLocaleString()}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>Delivery Fee</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontSize: '0.9rem', color: '#22c55e' }}>FREE</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>Discount</Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#22c55e' }}>-₹0</Typography>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>Total</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#22c55e', fontSize: '1.25rem' }}>
                    ₹{total.toLocaleString()}
                  </Typography>
                </Box>
                
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={() => navigate('/checkout')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{ 
                    bgcolor: '#22c55e', 
                    '&:hover': { bgcolor: '#16a34a' },
                    py: 1.5,
                    borderRadius: 2.5,
                    fontWeight: 600,
                  }}
                >
                  Proceed to Checkout
                </Button>
                
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                  py: 1.5,
                  px: 2,
                  bgcolor: '#f0fdf4',
                  borderRadius: 2,
                }}>
                  <AccessTimeIcon sx={{ fontSize: 16, color: '#22c55e' }} />
                  <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 500 }}>
                    Delivery in 30 minutes
                  </Typography>
                </Box>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Sticky Checkout - Mobile Only */}
      {isMobile && (
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: 'white',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          p: 2,
          zIndex: 1100,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {itemCount} items
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#22c55e' }}>
                ₹{total.toLocaleString()}
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/checkout')}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                bgcolor: '#22c55e', 
                '&:hover': { bgcolor: '#16a34a' },
                px: 4,
                py: 1.25,
                borderRadius: 2.5,
                fontWeight: 600,
              }}
            >
              Checkout
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CartPage;