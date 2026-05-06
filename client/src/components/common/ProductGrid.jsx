import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ProductCard from '../product/ProductCard';
import { ProductGridSkeleton } from './Skeleton';

export const ProductGrid = ({ products, loading, columns = 4 }) => {
  const getGridColumns = () => {
    if (typeof columns === 'object') {
      return columns;
    }
    switch (columns) {
      case 2: return { xs: 6, sm: 6 };
      case 3: return { xs: 6, sm: 6, md: 4 };
      case 4: return { xs: 6, sm: 6, md: 4, lg: 3 };
      case 6: return { xs: 6, sm: 6, md: 4, lg: 2 };
      default: return { xs: 6, sm: 6, md: 4, lg: 3 };
    }
  };

  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  const productList = Array.isArray(products) ? products : [];

  if (productList.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No products found
        </Typography>
      </Box>
    );
  }

return (
    <Grid container spacing={2}>
      {productList.map((product, index) => (
        <Grid item {...getGridColumns()} key={product.id}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductGrid;