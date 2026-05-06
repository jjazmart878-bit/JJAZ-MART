import { useState } from 'react';
import { Card, CardMedia, CardContent, CardActions, Typography, Box, IconButton, Chip } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images || [];
  const image = images[0] || '/placeholder.jpg';
  const originalPrice = product.original_price || product.original_price;
  const hasDiscount = originalPrice && Number(originalPrice) > Number(product.price);
  const discount = hasDiscount
    ? Math.round(((Number(originalPrice) - Number(product.price)) / Number(originalPrice)) * 100)
    : 0;
  const isOutOfStock = !product.is_active || Number(product.quantity) <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isOutOfStock) {
      addItem(product, 1);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleClick = () => {
    navigate(`/products/${product.slug}`);
  };

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        borderRadius: 3,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        border: '1px solid #f0f0f0',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 20px -4px rgba(0,0,0,0.15)',
          borderColor: '#22c55e',
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', height: { xs: 140, sm: 160 }, bgcolor: '#f8fafc', flexShrink: 0 }}>
        <CardMedia
          component="img"
          image={image}
          alt={product.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.08)' : 'scale(1)',
          }}
        />
        {discount > 0 && (
          <Chip
            label={`-${discount}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              bgcolor: '#dc2626',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}
        {product.is_featured && (
          <Chip
            label="Featured"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: '#0284c7',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        )}
        {isOutOfStock && (
          <Chip
            label="Out of Stock"
            size="small"
            sx={{
              position: 'absolute',
              top: product.is_featured ? 36 : 12,
              right: 12,
              bgcolor: '#64748b',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        )}
        <IconButton
          size="small"
          onClick={handleWishlist}
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            bgcolor: 'white',
            boxShadow: 1,
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          {isInWishlist(product.id) ? (
            <FavoriteIcon sx={{ color: '#dc2626', fontSize: 20 }} />
          ) : (
            <FavoriteBorderIcon sx={{ color: '#64748b', fontSize: 20 }} />
          )}
        </IconButton>
      </Box>
      <CardContent sx={{ flexGrow: 1, pb: 1, px: 1.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.7rem', mb: 0.5 }}
        >
          {product.category_name}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 500,
            fontSize: '0.875rem',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.2em',
          }}
        >
          {product.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
            ₹{Number(product.price).toLocaleString()}
          </Typography>
          {hasDiscount && (
            <Typography
              variant="body2"
              sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.8rem' }}
            >
              ₹{Number(originalPrice).toLocaleString()}
            </Typography>
          )}
          {hasDiscount && (
            <Chip label={`-${discount}%`} size="small" sx={{ bgcolor: '#fee2e2', color: '#dc2626', height: 20, fontSize: '0.65rem' }} />
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
<Typography variant="caption" color="text.secondary">
            {isOutOfStock ? 'Out of Stock' : `In Stock (${product.quantity})`}
          </Typography>
          <Box
            component={motion.button}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              bgcolor: isOutOfStock ? '#94a3b8' : '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: 2,
              px: 2,
              py: 0.75,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: isOutOfStock ? '#94a3b8' : '#16a34a' },
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 16 }} />
            {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          </Box>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProductCard;