const products = [];

// Product templates by category
const categories = {
  Electronics: [
    { base: "Laptop", brands: ["Dell", "HP", "Lenovo", "Asus", "Acer"], priceRange: [599, 2499] },
    { base: "Smartphone", brands: ["Samsung", "OnePlus", "Xiaomi", "Realme", "Oppo"], priceRange: [199, 1299] },
    { base: "Tablet", brands: ["Samsung", "Lenovo", "Amazon", "Huawei"], priceRange: [149, 899] },
    { base: "Smartwatch", brands: ["Fitbit", "Garmin", "Amazfit", "Samsung"], priceRange: [99, 449] },
    { base: "Headphones", brands: ["Sony", "Bose", "JBL", "Sennheiser", "Audio-Technica"], priceRange: [29, 399] },
    { base: "Wireless Earbuds", brands: ["Apple", "Samsung", "Sony", "Jabra"], priceRange: [49, 249] },
    { base: "Bluetooth Speaker", brands: ["JBL", "Bose", "Sony", "Ultimate Ears"], priceRange: [39, 299] },
    { base: "Gaming Mouse", brands: ["Logitech", "Razer", "Corsair", "SteelSeries"], priceRange: [29, 149] },
    { base: "Mechanical Keyboard", brands: ["Corsair", "Razer", "Logitech", "HyperX"], priceRange: [79, 199] },
    { base: "External Hard Drive", brands: ["Seagate", "WD", "Toshiba", "Samsung"], priceRange: [49, 199] },
    { base: "Webcam", brands: ["Logitech", "Razer", "Microsoft"], priceRange: [39, 149] },
    { base: "Monitor", brands: ["Dell", "LG", "Samsung", "Asus"], priceRange: [149, 799] },
    { base: "Router", brands: ["TP-Link", "Netgear", "Asus", "Linksys"], priceRange: [39, 299] },
    { base: "Power Bank", brands: ["Anker", "Belkin", "RAVPower"], priceRange: [19, 79] },
  ],
  
  Clothing: [
    { base: "T-Shirt", types: ["Cotton", "Polo", "V-Neck", "Graphic"], priceRange: [15, 49] },
    { base: "Jeans", types: ["Skinny", "Regular Fit", "Slim Fit", "Bootcut"], priceRange: [39, 89] },
    { base: "Hoodie", types: ["Pullover", "Zip-Up", "Graphic"], priceRange: [29, 79] },
    { base: "Jacket", types: ["Denim", "Leather", "Bomber", "Winter"], priceRange: [49, 199] },
    { base: "Dress", types: ["Casual", "Formal", "Maxi", "Summer"], priceRange: [29, 149] },
    { base: "Sweater", types: ["Crew Neck", "Cardigan", "Turtleneck"], priceRange: [35, 89] },
    { base: "Shorts", types: ["Denim", "Cargo", "Sports", "Chino"], priceRange: [19, 59] },
    { base: "Skirt", types: ["Mini", "Midi", "Maxi", "Pencil"], priceRange: [25, 69] },
  ],
  
  Home: [
    { base: "Coffee Maker", types: ["Drip", "Espresso", "French Press", "Pod"], priceRange: [29, 299] },
    { base: "Blender", types: ["Countertop", "Immersion", "Personal", "High-Speed"], priceRange: [29, 199] },
    { base: "Air Fryer", types: ["Compact", "Large Capacity", "Oven Style"], priceRange: [59, 199] },
    { base: "Vacuum Cleaner", types: ["Upright", "Cordless", "Robot", "Handheld"], priceRange: [79, 499] },
    { base: "Bed Sheets Set", types: ["Cotton", "Microfiber", "Linen", "Silk"], priceRange: [29, 149] },
    { base: "Pillow", types: ["Memory Foam", "Down", "Cooling", "Cervical"], priceRange: [19, 89] },
    { base: "Lamp", types: ["Desk", "Floor", "Table", "LED"], priceRange: [25, 129] },
    { base: "Wall Clock", types: ["Analog", "Digital", "Modern", "Vintage"], priceRange: [15, 79] },
    { base: "Trash Can", types: ["Step", "Touchless", "Pedal", "Kitchen"], priceRange: [19, 89] },
  ],
  
  Sports: [
    { base: "Running Shoes", brands: ["Nike", "Adidas", "New Balance", "Asics"], priceRange: [59, 149] },
    { base: "Yoga Mat", types: ["Standard", "Extra Thick", "Travel", "Cork"], priceRange: [19, 89] },
    { base: "Dumbbell Set", types: ["Adjustable", "Fixed Weight", "Neoprene"], priceRange: [29, 199] },
    { base: "Resistance Bands", types: ["Loop", "Tube", "Figure 8"], priceRange: [9, 39] },
    { base: "Jump Rope", types: ["Speed", "Weighted", "Adjustable"], priceRange: [9, 29] },
    { base: "Gym Bag", types: ["Duffel", "Backpack", "Tote"], priceRange: [19, 79] },
    { base: "Water Bottle", types: ["Insulated", "Collapsible", "Smart"], priceRange: [12, 39] },
    { base: "Fitness Tracker", brands: ["Fitbit", "Garmin", "Amazfit"], priceRange: [39, 149] },
  ],
  
  Books: [
    { base: "Fiction Novel", genres: ["Mystery", "Romance", "Sci-Fi", "Fantasy", "Thriller"], priceRange: [12, 29] },
    { base: "Non-Fiction", genres: ["Biography", "Self-Help", "History", "Science", "Business"], priceRange: [14, 34] },
    { base: "Cookbook", types: ["Vegetarian", "Baking", "Quick Meals", "International"], priceRange: [16, 39] },
    { base: "Children's Book", types: ["Picture Book", "Chapter Book", "Educational"], priceRange: [8, 24] },
  ],
  
  Toys: [
    { base: "Building Blocks Set", types: ["Classic", "Themed", "Magnetic"], priceRange: [19, 89] },
    { base: "Action Figure", types: ["Superhero", "Movie Character", "Anime"], priceRange: [12, 49] },
    { base: "Board Game", types: ["Strategy", "Family", "Party", "Educational"], priceRange: [15, 59] },
    { base: "Puzzle", types: ["Jigsaw", "3D", "Brain Teaser"], priceRange: [9, 39] },
    { base: "Remote Control Car", types: ["Off-Road", "Racing", "Stunt"], priceRange: [24, 99] },
    { base: "Stuffed Animal", types: ["Bear", "Dog", "Unicorn", "Dinosaur"], priceRange: [12, 39] },
  ]
};

const descriptions = {
  Electronics: [
    "High-performance device with cutting-edge technology",
    "Premium quality with long-lasting durability",
    "Sleek design meets powerful functionality",
    "Advanced features for modern lifestyle",
    "Top-rated performance and reliability"
  ],
  Clothing: [
    "Comfortable and stylish for everyday wear",
    "Premium fabric with modern fit",
    "Versatile design for any occasion",
    "High-quality material with attention to detail",
    "Classic style with contemporary touch"
  ],
  Home: [
    "Essential addition to your home",
    "Durable and practical for daily use",
    "Modern design with superior functionality",
    "High-quality materials for lasting value",
    "Efficient and easy to use"
  ],
  Sports: [
    "Professional-grade equipment for peak performance",
    "Comfortable and supportive for active lifestyle",
    "Durable construction for intense workouts",
    "Lightweight and portable design",
    "Enhanced performance and comfort"
  ],
  Books: [
    "Captivating read from start to finish",
    "Insightful and thought-provoking content",
    "Expertly written and beautifully illustrated",
    "Essential reading for enthusiasts",
    "Engaging storytelling and rich detail"
  ],
  Toys: [
    "Hours of fun and entertainment",
    "Promotes creativity and imagination",
    "Safe and durable for kids",
    "Educational and entertaining",
    "Perfect gift for children"
  ]
};

const imageUrls = {
  Electronics: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661",
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12"
  ],
  Clothing: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    "https://images.unsplash.com/photo-1542272604-787c3835535d",
    "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea"
  ],
  Home: [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a",
    "https://images.unsplash.com/photo-1513694203232-719a280e022f"
  ],
  Sports: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f"
  ],
  Books: [
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f",
    "https://images.unsplash.com/photo-1512820790803-83ca734da794",
    "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f"
  ],
  Toys: [
    "https://images.unsplash.com/photo-1587654780291-39c9404d746b",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1"
  ]
};

let productCounter = 1;

// Generate products for each category
for (const [category, items] of Object.entries(categories)) {
  items.forEach(item => {
    const variants = item.brands || item.types || item.genres || ["Standard"];
    
    variants.forEach(variant => {
      if (productCounter > 100) return;
      
      const name = `${variant} ${item.base}`;
      const price = (Math.random() * (item.priceRange[1] - item.priceRange[0]) + item.priceRange[0]).toFixed(2);
      const stock = Math.floor(Math.random() * 90) + 10; // 10-99
      const description = descriptions[category][Math.floor(Math.random() * descriptions[category].length)];
      const imageUrl = imageUrls[category][Math.floor(Math.random() * imageUrls[category].length)] + "?w=300";
      
      products.push({
        name: name,
        description: description,
        price: parseFloat(price),
        category: category,
        imageUrl: imageUrl,
        stock: stock,
        sku: `${category.substring(0, 3).toUpperCase()}-${String(productCounter).padStart(3, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      productCounter++;
    });
  });
}

// Output as MongoDB insertMany command
console.log('db.products.insertMany([');
products.forEach((product, index) => {
  console.log(JSON.stringify(product, null, 2) + (index < products.length - 1 ? ',' : ''));
});
console.log('])');
