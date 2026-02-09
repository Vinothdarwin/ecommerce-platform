kubectl exec -it $(kubectl get pod -l app=mongo -n ecommerce -o jsonpath='{.items[0].metadata.name}') \
-n ecommerce -- mongosh ecommerce-products --eval '
db.products.deleteMany({});

function img(category, index) {
  return `/images/products/${category}/${index}.jpg`;
}

function createProduct(name, category, brand, price, index) {
  return {
    name: name,
    description: `${name} from ${brand}. Premium quality product for everyday use.`,
    price: price,
    category: category,
    brand: brand,
    stock: Math.floor(Math.random() * 100) + 10,
    thumbnail: img(category, index),
    images: [
      img(category, index),
      img(category, (index % 5) + 1)
    ],
    rating: (Math.random() * 1.5 + 3.5).toFixed(1),
    reviewCount: Math.floor(Math.random() * 500),
    sku: `${category.substring(0,3).toUpperCase()}-${index}`,
    featured: Math.random() > 0.7,
    onSale: Math.random() > 0.6,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

const products = [

  // BOOKS
  createProduct("JavaScript Complete Guide", "books", "TechBooks", 39.99, 1),
  createProduct("Mystery Thriller Novel", "books", "NovelHouse", 19.99, 2),
  createProduct("Business Strategy Handbook", "books", "BusinessPress", 29.99, 3),
  createProduct("Photography Basics", "books", "ArtBooks", 34.99, 4),
  createProduct("Travel Europe Guide", "books", "TravelBooks", 24.99, 5),

  // ELECTRONICS
  createProduct("Wireless Headphones", "electronics", "TechPro", 79.99, 1),
  createProduct("Smart Watch Pro", "electronics", "SmartLife", 199.99, 2),
  createProduct("Gaming Mouse", "electronics", "GameMaster", 59.99, 3),
  createProduct("Bluetooth Speaker", "electronics", "SoundMax", 39.99, 4),
  createProduct("4K Webcam", "electronics", "TechPro", 89.99, 5),

  // CLOTHING
  createProduct("Cotton T-Shirt", "clothing", "UrbanStyle", 29.99, 1),
  createProduct("Slim Fit Jeans", "clothing", "DenimCo", 59.99, 2),
  createProduct("Classic Hoodie", "clothing", "ComfortWear", 49.99, 3),
  createProduct("Running Sneakers", "clothing", "SportElite", 79.99, 4),
  createProduct("Winter Jacket", "clothing", "OutdoorMax", 89.99, 5),

  // AUTOMOTIVE
  createProduct("Car Phone Mount", "automotive", "DrivePro", 19.99, 1),
  createProduct("4K Dash Camera", "automotive", "AutoVision", 129.99, 2),
  createProduct("Portable Car Vacuum", "automotive", "CleanDrive", 49.99, 3),
  createProduct("Digital Tire Inflator", "automotive", "RoadMaster", 39.99, 4),
  createProduct("Emergency Tool Kit", "automotive", "SafeDrive", 59.99, 5)
];

db.products.insertMany(products);

db.products.createIndex({ category: 1 });
db.products.createIndex({ featured: 1 });

print("✅ Loaded " + db.products.countDocuments() + " products with frontend images!");
'
