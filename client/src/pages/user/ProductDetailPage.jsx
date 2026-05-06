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
    <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>Home</Link>
          <Link underline="hover" color="inherit" onClick={() => navigate('/products')} sx={{ cursor: 'pointer' }}>Products</Link>
          {product.category_name && (
            <Link underline="hover" color="inherit" onClick={() => navigate(`/products?category=${product.category_slug}`)} sx={{ cursor: 'pointer' }}>
              {product.category_name}
            </Link>
          )}
          <Typography color="text.primary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {product.title}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          {/* Product Images */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Box
                  component="img"
                  src={images[selectedImage] || 'https://via.placeholder.com/500'}
                  alt={product.title}
                  sx={{
                    width: '100%',
                    height: { xs: 300, md: 450 },
                    objectFit: 'cover',
                    borderRadius: 3,
                    mb: 2,
                    boxShadow: 2,
                  }}
                />
                {images.length > 1 && (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <Box
                        key={i}
                        component="img"
                        src={img}
                        onClick={() => setSelectedImage(i)}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: selectedImage === i ? 'primary.main' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': { borderColor: 'primary.light' },
                        }}
                      />
                    ))}
                  </Box>
                )}

                {discount > 0 && (
                  <Chip
                    label={`Save ${discount}%`}
                    color="error"
                    sx={{ position: 'absolute', top: 16, left: 16, fontWeight: 600 }}
                  />
                )}

                <IconButton
                  onClick={handleWishlist}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'white',
                    boxShadow: 2,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  {isInWishlist(product.id) ? (
                    <FavoriteIcon sx={{ color: '#dc2626' }} />
                  ) : (
                    <FavoriteBorderIcon />
                  )}
                </IconButton>
              </Box>
            </motion.div>
          </Grid>

          {/* Product Details */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {product.category_name && (
                <Chip
                  label={product.category_name}
                  size="small"
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              )}

              <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, lineHeight: 1.2 }}>
                {product.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Rating value={avgRating || 4.5} readOnly precision={0.5} size="small" />
                <Typography variant="body2" color="text.secondary">
                  ({reviews.length || 128} reviews)
                </Typography>
                <Chip
                  label={product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                  size="small"
                  color={product.quantity > 0 ? 'success' : 'error'}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="h2" color="primary.main" fontWeight={700}>
                  ₹{Number(product.price).toLocaleString()}
                </Typography>
                {hasDiscount && (
                  <>
                    <Typography
                      variant="h5"
                      sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                    >
                      ₹{Number(product.original_price).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="error.main" fontWeight={500}>
                      You save ₹{Number(product.original_price - product.price).toLocaleString()}
                    </Typography>
                  </>
                )}
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Quantity Selector */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>Quantity:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    variant="outlined"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="h5" sx={{ minWidth: 50, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    variant="outlined"
                    onClick={() => setQuantity(quantity + 1)}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    <AddIcon />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {product.quantity} available
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                  sx={{ flex: 1, py: 1.5 }}
                >
                  {product.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleWishlist}
                  sx={{ py: 1.5 }}
                >
                  {isInWishlist(product.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Product Info */}
              <Card sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  {[
                    { icon: <LocalOfferIcon />, label: 'SKU', value: `PRD-${product.id}` },
                    { icon: <InventoryIcon />, label: 'Category', value: product.category_name || 'Uncategorized' },
                    { icon: <LocalShippingIcon />, label: 'Shipping', value: 'Free shipping above ₹500' },
                  ].map((item, i) => (
                    <Grid item xs={4} key={i}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Box sx={{ color: 'primary.main', mb: 1 }}>{item.icon}</Box>
                        <Typography variant="caption" color="text.secondary">{item.label}</Typography>
                        <Typography variant="body2" fontWeight={500}>{item.value}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Description Tabs */}
              <Card sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  {['description', 'specifications', 'reviews'].map((tab) => (
                    <Typography
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      sx={{
                        cursor: 'pointer',
                        pb: 1,
                        px: 2,
                        borderBottom: 2,
                        borderColor: activeTab === tab ? 'primary.main' : 'transparent',
                        fontWeight: activeTab === tab ? 600 : 400,
                        textTransform: 'capitalize',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      {tab}
                    </Typography>
                  ))}
                </Box>

                {activeTab === 'description' && (
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                    {product.description || 'No description available for this product. Please contact us for more information.'}
                  </Typography>
                )}

                {activeTab === 'specifications' && (
                  <Box>
                    {product.short_description && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Features</Typography>
                        <Typography variant="body2" color="text.secondary">{product.short_description}</Typography>
                      </Box>
                    )}
                    {product.specifications ? (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>Specifications</Typography>
                        {product.specifications.split('\n').map((line, i) => {
                          const [key, ...valueParts] = line.split(':');
                          return (
                            <Box key={i} sx={{ display: 'flex', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 120, color: '#64748b' }}>{key.trim()}</Typography>
                              <Typography variant="body2">{valueParts.join(':').trim()}</Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No specifications available.</Typography>
                    )}
                  </Box>
                )}

                {activeTab === 'reviews' && (
                  <Box>
                    {!user ? (
                      <Box sx={{ textAlign: 'center', py: 3, mb: 3 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          Please login to write a review
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/login')}>
                          Login to Review
                        </Button>
                      </Box>
                    ) : !showReviewForm && (
                      <Button variant="contained" onClick={() => setShowReviewForm(true)} sx={{ mb: 3 }}>
                        Write a Review
                      </Button>
                    )}
                    {showReviewForm && (
                      <Card sx={{ p: 3, mb: 3, bgcolor: '#f8fafc' }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>Your Review</Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>Rating</Typography>
                          <Rating value={reviewRating} onChange={(e, v) => setReviewRating(v)} />
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          label="Comment"
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Button variant="contained" onClick={() => createReviewMutation.mutate({ product_id: product.id, rating: reviewRating, comment: reviewComment })}>
                            Submit Review
                          </Button>
                          <Button variant="outlined" onClick={() => setShowReviewForm(false)}>
                            Cancel
                          </Button>
                        </Box>
                      </Card>
                    )}
                    {reviews.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">No reviews yet. Be the first to review!</Typography>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                          <Rating value={avgRating} readOnly precision={0.5} />
                          <Typography variant="h6">{avgRating.toFixed(1)} out of 5</Typography>
                          <Typography variant="body2" color="text.secondary">({reviews.length} reviews)</Typography>
                        </Box>
                        {reviews.map((review) => (
                          <Box key={review.id} sx={{ p: 2, borderBottom: '1px solid #f0f0f0' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: '#22c55e', fontSize: 14 }}>
                                {review.user_name?.charAt(0) || 'U'}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>{review.user_name || 'User'}</Typography>
                              <Rating value={review.rating} readOnly size="small" />
                            </Box>
                            <Typography variant="body2" color="text.secondary">{review.comment}</Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                )}
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              Related Products
            </Typography>
            <ProductGrid products={relatedProducts} loading={false} columns={4} />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default ProductDetailPage;