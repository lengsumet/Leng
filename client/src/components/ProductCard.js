import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button, Box } from '@mui/material';

function ProductCard({ product }) {
  // Default product data if none is provided (for placeholder/testing)
  const defaultProduct = {
    name: 'Sample Product',
    image: 'https://via.placeholder.com/300x200.png?text=Product+Image',
    price: 'Rp 100.000',
    sold: 120,
    location: 'Jakarta'
  };

  const currentProduct = product || defaultProduct;

  return (
    <Card sx={{ maxWidth: 345, margin: 2 }}>
      <CardMedia
        component="img"
        height="140"
        image={currentProduct.image}
        alt={currentProduct.name}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" sx={{
          display: '-webkit-box',
          overflow: 'hidden',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          textOverflow: 'ellipsis',
          height: '3em' // Adjust based on line height and desired number of lines
        }}>
          {currentProduct.name}
        </Typography>
        <Typography variant="h5" color="error" sx={{ fontWeight: 'bold', mb: 1 }}>
          {currentProduct.price}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
          <Typography variant="body2">
            {currentProduct.sold} terjual
          </Typography>
          <Typography variant="body2">
            {currentProduct.location}
          </Typography>
        </Box>
      </CardContent>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
        <Button variant="outlined" size="small" sx={{ width: '90%'}}>
          Lihat Detail
        </Button>
      </Box>
    </Card>
  );
}

export default ProductCard;
