import { Box, Typography, Rating as MuiRating } from '@mui/material';

export const Rating = ({ value, onChange, readOnly, size = 'medium', ...props }) => (
  <MuiRating
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    size={size}
    precision={0.5}
    emptyIcon={<span style={{ color: '#cbd5e1' }}>★</span>}
    {...props}
  />
);

export default Rating;