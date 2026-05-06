import { useState, useRef } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Slider, Typography } from '@mui/material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropper = ({ open, onClose, imageSrc, onCropComplete }) => {
  const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
  const [completed, setCompleted] = useState(null);
  const imgRef = useRef(null);

  const getCroppedImage = async () => {
    if (!imgRef.current || !completed) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completed.width * scaleX;
    canvas.height = completed.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imgRef.current,
      completed.x * scaleX,
      completed.y * scaleY,
      completed.width * scaleX,
      completed.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCropComplete(dataUrl);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Crop Image</DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: 400, display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', p: 2 }}>
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompleted(c)}
              aspect={1}
              square
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop"
                style={{ maxHeight: '350px', maxWidth: '100%' }}
              />
            </ReactCrop>
          )}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Drag to position. Use slider to adjust crop area.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={getCroppedImage} disabled={!completed}>
          Apply Crop
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropper;