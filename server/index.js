const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 3001;

// Sample product data (can be moved to a separate file or database later)
const sampleProducts = [
  {
    id: 1,
    name: 'Baju Kemeja Pria Lengan Panjang Slim Fit Terbaru Kualitas Premium',
    image: 'https://via.placeholder.com/300x200.png?text=Kemeja+Pria',
    price: 'Rp 150.000',
    sold: 250,
    location: 'Bandung'
  },
  {
    id: 2,
    name: 'Sepatu Sneakers Wanita Casual Sporty Ringan dan Nyaman Dipakai Sehari-hari',
    image: 'https://via.placeholder.com/300x200.png?text=Sepatu+Sneakers',
    price: 'Rp 275.000',
    sold: 180,
    location: 'Surabaya'
  },
  {
    id: 3,
    name: 'Tas Ransel Laptop Anti Air dengan USB Charging Port',
    image: 'https://via.placeholder.com/300x200.png?text=Tas+Ransel',
    price: 'Rp 350.000',
    sold: 95,
    location: 'Jakarta Pusat'
  },
  {
    id: 4,
    name: 'Jam Tangan Digital Pria Wanita Model Terbaru Tahan Air',
    image: 'https://via.placeholder.com/300x200.png?text=Jam+Tangan',
    price: 'Rp 99.000',
    sold: 500,
    location: 'Medan'
  },
  {
    id: 5,
    name: 'Powerbank 20000mAh Fast Charging Dual Output LED Display',
    image: 'https://via.placeholder.com/300x200.png?text=Powerbank',
    price: 'Rp 180.000',
    sold: 120,
    location: 'Jakarta Barat'
  },
  {
    id: 6,
    name: 'Headset Bluetooth TWS Gaming Latency Rendah Suara Jernih',
    image: 'https://via.placeholder.com/300x200.png?text=Headset+TWS',
    price: 'Rp 220.000',
    sold: 300,
    location: 'Yogyakarta'
  }
];

// API endpoint to get products
app.get('/api/products', (req, res) => {
  res.json(sampleProducts);
});

// Proxy middleware options - for other API calls you might want to proxy
const proxyOptions = {
  target: 'https://jsonplaceholder.typicode.com', // Example: for other external APIs
  changeOrigin: true,
  pathRewrite: {
    '^/api/external': '', // Example: proxy requests to /api/external
  },
  selfHandleResponse: true, // Important: allows us to inspect the response
  onProxyRes: (proxyRes, req, res) => {
    // If you need to modify the response from the proxied server
    // For now, just pipe it through
    proxyRes.pipe(res);
  }
};

const externalApiProxy = createProxyMiddleware('/api/external', proxyOptions);
app.use('/api/external', externalApiProxy);


app.get('/', (req, res) => {
  res.send('Hello from the backend server!');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
