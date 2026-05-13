import { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, IconButton, Chip, Rating, Divider, Breadcrumbs, Link, Avatar, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StarIcon from '@mui/icons-material/Star';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { productsAPI, reviewsAPI } from '../../api';
import { DetailPageSkeleton, ProductGridSkeleton } from '../../components/common/Skeleton';
import ProductGrid from '../../components/common/ProductGrid';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsAPI.getBySlug(slug),
    enabled: !!slug,
  });

  const { data: relatedData } = useQuery({
    queryKey: ['related', data?.data?.id],
    queryFn: () => productsAPI.getRelated(data?.data?.id, 4),
    enabled: !!data?.data?.id,
  });

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', data?.data?.id],
    queryFn: () => reviewsAPI.getByProduct(data?.data?.id),
    enabled: !!data?.data?.id,
  });

  const createReviewMutation = useMutation({
    mutationFn: reviewsAPI.create,
    onSuccess: () => {
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewComment('');
      refetchReviews();
    },
    onError: () => toast.error('Failed to submit review'),
  });

  const product = data?.data;
  const relatedProducts = relatedData?.data || [];
  const images = product?.images || [];
  const reviews = reviewsData?.data || [];
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

const originalPrice = product?.original_price || product?.original_price;
  const hasDiscount = originalPrice && Number(originalPrice) > Number(product?.price);
  const discount = hasDiscount
    ? Math.round(((Number(originalPrice) - Number(product?.price)) / Number(originalPrice)) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${product.title} added to cart`);
  };

  const handleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <DetailPageSkeleton />
        </Container>
      </Box>
    );
  }

  if (!product) {
    return (
      <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>Product Not Found</Typography>
            <Button variant="contained" onClick={() => navigate('/products')}>
              Back to Products
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: { xs: 0.5, md: 3 }, pb: { xs: 8, md: 3 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2 } }}>
        <Breadcrumbs sx={{ mb: { xs: 0.5, md: 2 }, fontSize: { xs: '0.65rem', md: '0.875rem' } }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer', fontSize: { xs: '0.65rem', md: '0.875rem' } }}>Home</Link>
          <Link underline="hover" color="inherit" onClick={() => navigate('/products')} sx={{ cursor: 'pointer', fontSize: { xs: '0.65rem', md: '0.875rem' } }}>Products</Link>
          <Typography color="text.primary" sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: '0.65rem', md: '0.875rem' } }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={2}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
              <Box sx={{ position: { md: 'sticky' }, top: { md: 100 } }}>
                <Box component="img" src={images[selectedImage] || 'https://via.placeholder.com/500'} alt={product.title} sx={{ width: '100%', height: { xs: 220, md: 400 }, objectFit: 'cover', borderRadius: 2, mb: 1, boxShadow: 1 }} />
                {images.length > 1 && <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>{images.slice(0, 4).map((img, i) => <Box key={i} component="img" src={img} onClick={() => setSelectedImage(i)} sx={{ width: { xs: 45, sm: 55 }, height: { xs: 45, sm: 55 }, objectFit: 'cover', borderRadius: 1, cursor: 'pointer', border: '2px solid', borderColor: selectedImage === i ? '#22c55e' : 'transparent' }} />)}</Box>}
                {discount > 0 && <Chip label={`-${discount}%`} size="small" sx={{ position: 'absolute', top: 6, left: 6, fontSize: '0.65rem', height: 20 }} />}
                <IconButton onClick={handleWishlist} sx={{ position: 'absolute', top: 6, right: 6, bgcolor: 'white', boxShadow: 1, p: 0.5 }}>
                  {isInWishlist(product.id) ? <FavoriteIcon sx={{ color: '#dc2626', fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Box sx={{ pr: { md: 3 } }}>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                  <Rating value={avgRating || 4.5} readOnly precision={0.5} sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.75rem' } }}>({reviews.length || 0})</Typography>
                  <Chip label={product.quantity > 0 ? 'In Stock' : 'Out of Stock'} size="small" color={product.quantity > 0 ? 'success' : 'error'} sx={{ fontSize: { xs: '0.55rem', md: '0.65rem' }, height: { xs: 18, md: 20 } }} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6" fontWeight={700} color="#22c55e" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>₹{Number(product.price).toLocaleString()}</Typography>
                  {hasDiscount && <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}>₹{originalPrice}</Typography>}
                  {hasDiscount && (
                    <Typography variant="body2" color="error.main" fontWeight={500} sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                      Save ₹{Number(product.original_price - product.price).toLocaleString()}
                    </Typography>
                  )}
                </Box>

              <Divider sx={{ my: 1 }} />

              {/* Quantity Selector */}
              <Box sx={{ mb: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'white', borderRadius: 1.5 }}>
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.8rem' }}>Qty:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <IconButton size="small" onClick={() => setQuantity(Math.max(1, quantity - 1))} sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}><RemoveIcon sx={{ fontSize: 14 }} /></IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center', fontSize: '0.85rem' }}>{quantity}</Typography>
                    <IconButton size="small" onClick={() => setQuantity(quantity + 1)} sx={{ border: '1px solid', borderColor: 'divider', p: 0.25 }}><AddIcon sx={{ fontSize: 14 }} /></IconButton>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', fontSize: '0.7rem' }}>{product.quantity} available</Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" startIcon={<ShoppingCartIcon sx={{ fontSize: 16 }} />} onClick={handleAddToCart} disabled={product.quantity <= 0} sx={{ flex: 1, py: 0.75, fontSize: '0.8rem' }}>
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button variant="contained" size="large" onClick={() => { addItem(product, quantity); navigate('/checkout'); }} disabled={product.quantity <= 0} sx={{ flex: 1, py: 0.75, fontSize: '0.8rem', bgcolor: '#22c55e', '&:hover': { bgcolor: '#16a34a' } }}>
                  Buy Now
                </Button>
                <Button variant="outlined" size="large" onClick={handleWishlist} sx={{ py: 0.75, px: 0.75 }}>
                  {isInWishlist(product.id) ? <FavoriteIcon sx={{ fontSize: 16, color: '#dc2626' }} /> : <FavoriteBorderIcon sx={{ fontSize: 16 }} />}
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Product Info */}
              <Card sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={1}>
                  {[
                    { icon: <LocalOfferIcon sx={{ fontSize: 16 }} />, label: 'SKU', value: `PRD-${product.id}` },
                    { icon: <InventoryIcon sx={{ fontSize: 16 }} />, label: 'Category', value: product.category_name || 'Uncategorized' },
                    { icon: <LocalShippingIcon sx={{ fontSize: 16 }} />, label: 'Shipping', value: 'Free above ₹500' },
                  ].map((item, i) => (
                    <Grid item xs={4} key={i}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Box sx={{ color: 'primary.main', mb: 0.5 }}>{item.icon}</Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.55rem', md: '0.75rem' } }}>{item.label}</Typography>
                        <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Description Tabs */}
              <Card sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, borderBottom: 1, borderColor: 'divider', overflowX: 'auto' }}>
                  {['description', 'specifications', 'reviews'].map((tab) => (
                    <Typography
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      sx={{
                        cursor: 'pointer',
                        pb: 0.5,
                        px: 1.5,
                        borderBottom: 2,
                        borderColor: activeTab === tab ? 'primary.main' : 'transparent',
                        fontWeight: activeTab === tab ? 600 : 400,
                        textTransform: 'capitalize',
                        fontSize: { xs: '0.75rem', md: '0.875rem' },
                        whiteSpace: 'nowrap',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {tab}
                    </Typography>
                  ))}
                </Box>

                {activeTab === 'description' && (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {product.description || 'No description available for this product. Please contact us for more information.'}
                  </Typography>
                )}

                {activeTab === 'specifications' && (
                  <Box>
                    {product.short_description && (
                      <Box sx={{ mb: 1.5 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Features</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>{product.short_description}</Typography>
                      </Box>
                    )}
                    {product.specifications ? (
                      <Box sx={{ mt: 1.5 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Specifications</Typography>
                        {product.specifications.split('\n').map((line, i) => {
                          const [key, ...valueParts] = line.split(':');
                          return (
                            <Box key={i} sx={{ display: 'flex', py: 0.25, borderBottom: '1px solid #f0f0f0' }}>
                              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 100, color: '#64748b', fontSize: { xs: '0.65rem', md: '0.875rem' } }}>{key.trim()}</Typography>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' } }}>{valueParts.join(':').trim()}</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>No specifications available.</Typography>
                    )}
                  </Box>
                )}

                {activeTab === 'reviews' && (
                  <Box>
                    {!user ? (
                      <Box sx={{ textAlign: 'center', py: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
                          Please login to write a review
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/login')} sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, py: 0.5 }}>
                          Login to Review
                        </Button>
                      </Box>
                    ) : !showReviewForm && (
                      <Button variant="contained" onClick={() => setShowReviewForm(true)} sx={{ mb: 2, fontSize: { xs: '0.7rem', md: '0.875rem' }, py: 0.5 }}>
                        Write a Review
                      </Button>
                    )}
                    {showReviewForm && (
                      <Card sx={{ p: 2, mb: 2, bgcolor: '#f8fafc' }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>Your Review</Typography>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>Rating</Typography>
                          <Rating value={reviewRating} onChange={(e, v) => setReviewRating(v)} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={2}
                          placeholder="Comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          sx={{ mb: 1.5 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="contained" onClick={() => createReviewMutation.mutate({ product_id: product.id, rating: reviewRating, comment: reviewComment })} sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, py: 0.25 }}>
                            Submit
                          </Button>
                          <Button variant="outlined" onClick={() => setShowReviewForm(false)} sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' }, py: 0.25 }}>
                            Cancel
                          </Button>
                        </Box>
                      </Card>
                    )}
                    {reviews.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>No reviews yet. Be the first to review!</Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                          <Rating value={avgRating} readOnly precision={0.5} sx={{ fontSize: { xs: '0.85rem', md: '1rem' } }} />
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>{avgRating.toFixed(1)}/5</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.75rem' } }}>({reviews.length})</Typography>
                        </Box>
                        {reviews.slice(0, 3).map((review) => (
                          <Box key={review.id} sx={{ p: 1, borderBottom: '1px solid #f0f0f0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                              <Avatar sx={{ width: 24, height: 24, bgcolor: '#22c55e', fontSize: 10 }}>
                                {review.user_name?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500} sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' } }}>{review.user_name || 'User'}</Typography>
                              <Rating value={review.rating} readOnly size="small" sx={{ fontSize: { xs: '0.65rem', md: '0.875rem' } }} />
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.875rem' } }}>{review.comment}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                )}
              </Card>
            </Box>
            </motion.div>
          </Grid>
        </Grid>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, fontSize: { xs: '0.9rem', md: '1.25rem' } }}>
              Related Products
            </Typography>
            <ProductGrid products={relatedProducts} loading={false} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;