import { Skeleton } from '@mui/material';
import { Box, Grid } from '@mui/material';

export const CardSkeleton = ({ variant = 'rectangular', height = 200, width = '100%', ...props }) => (
  <Box {...props}>
    <Skeleton variant={variant} height={height} width={width} sx={{ borderRadius: 2 }} />
  </Box>
);

export const TextSkeleton = ({ lines = 2, ...props }) => (
  <Box {...props}>
    <Skeleton variant="text" width="100%" height={24} />
    {lines > 1 && <Skeleton variant="text" width="60%" height={24} />}
  </Box>
);

export const ProductCardSkeleton = () => (
  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
    <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 2, mb: 2 }} />
    <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
    <Skeleton variant="text" width="60%" height={20} />
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <Skeleton variant="rounded" width={80} height={36} />
      <Skeleton variant="rounded" width={100} height={36} />
    </Box>
  </Box>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={2} sm={3} md={2} key={i}>
        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, textAlign: 'center' }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
        </Box>
      </Grid>
    ))}
  </Grid>
);

export const CategoryGridSkeleton = ({ count = 8 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, i) => (
      <Grid item xs={4} sm={3} md={2} key={i}>
        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, textAlign: 'center' }}>
          <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 1 }} />
          <Skeleton variant="text" width="80%" height={20} sx={{ mx: 'auto' }} />
        </Box>
      </Grid>
    ))}
  </Grid>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <Box sx={{ width: '100%' }}>
    {Array.from({ length: rows }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', gap: 2, p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {Array.from({ length: columns }).map((_, j) => (
          <Skeleton key={j} variant="text" width={`${100 / columns}%`} height={24} />
        ))}
      </Box>
    ))}
  </Box>
);

export const DetailPageSkeleton = () => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
    <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    <Box>
      <Skeleton variant="text" width="80%" height={40} />
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={28} />
      <Skeleton variant="rounded" width={120} height={48} sx={{ mt: 2 }} />
      <Box sx={{ mt: 4 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
  </Box>
);

export default {
  CardSkeleton,
  TextSkeleton,
  ProductCardSkeleton,
  ProductGridSkeleton,
  TableSkeleton,
  DetailPageSkeleton,
};