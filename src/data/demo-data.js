// Sample data for demonstration and development

const FIRST_ORDER_TIME_OFFSET = 100000;
const SECOND_ORDER_TIME_OFFSET = 50000;

export const demoData = {
  customers: [
    { id: 0, name: 'Guest', phone: '', email: '' },
    {
      id: 2,
      name: 'Saman Perera',
      phone: '0711234567',
      email: 'saman.perera@email.com',
    },
    {
      id: 3,
      name: 'Nimal Silva',
      phone: '0729876543',
      email: 'nimal.s@email.com',
    },
    { id: 4, name: 'Kamal Fernando', phone: '0735556789', email: '' },
    {
      id: 5,
      name: 'Dilini Jayawardena',
      phone: '0744441234',
      email: 'dilini.j@email.com',
    },
    { id: 6, name: 'Ranil Wickramasinghe', phone: '0753335678', email: '' },
    { id: 7, name: 'Chaminda De Silva', phone: '0762224321', email: '' },
    {
      id: 8,
      name: 'Kumari Bandara',
      phone: '0771118765',
      email: 'kumari@email.com',
    },
    { id: 9, name: 'Priyanka Gunawardena', phone: '0780003456', email: '' },
    {
      id: 10,
      name: 'Roshan Mendis',
      phone: '0799996543',
      email: 'roshan.m@email.com',
    },
    {
      id: 11,
      name: 'Sanduni Rajapakse',
      phone: '0701237890',
      email: 'sanduni.r@email.com',
    },
  ],

  items: [
    // Beef Burgers
    {
      id: 1,
      name: 'Beef Whopper',
      price: 2050.85,
      category: 'Beef Burgers',
      image: 'products/beef-whopper.jpg',
    },
    {
      id: 2,
      name: 'Classic Beef',
      price: 1650.0,
      category: 'Beef Burgers',
      image: 'products/classic-beef.jpg',
    },
    {
      id: 3,
      name: 'Double Beef',
      price: 2450.0,
      category: 'Beef Burgers',
      image: 'products/double-beef.jpg',
    },
    {
      id: 4,
      name: 'Bacon Beef',
      price: 2250.0,
      category: 'Beef Burgers',
      image: 'products/bacon-beef.jpg',
    },

    // Chicken Burgers
    {
      id: 5,
      name: 'Crispy Chicken',
      price: 1850.0,
      category: 'Chicken Burgers',
      image: 'products/crispy-chicken.jpg',
    },
    {
      id: 6,
      name: 'Spicy Chicken',
      price: 1950.0,
      category: 'Chicken Burgers',
      image: 'products/spicy-chicken.jpg',
    },
    {
      id: 7,
      name: 'Grilled Chicken',
      price: 2050.0,
      category: 'Chicken Burgers',
      image: 'products/grilled-chicken.jpg',
    },

    // Veggie
    {
      id: 8,
      name: 'Veggie Burger',
      price: 913.56,
      category: 'Veggie Burger',
      image: 'products/veggie-burger.jpg',
    },
    {
      id: 9,
      name: 'Mushroom Burger',
      price: 1150.0,
      category: 'Veggie Burger',
      image: 'products/mushroom-burger.jpg',
    },

    // Sides
    {
      id: 10,
      name: 'Thick Cut Fries',
      price: 559.32,
      category: 'Sides',
      image: 'products/fries.jpg',
    },
    {
      id: 11,
      name: 'Onion Rings',
      price: 450.0,
      category: 'Sides',
      image: 'products/onion-rings.jpg',
    },
    {
      id: 12,
      name: 'Cheese Fries',
      price: 650.0,
      category: 'Sides',
      image: 'products/cheese-fries.jpg',
    },
    {
      id: 13,
      name: 'Coleslaw',
      price: 350.0,
      category: 'Sides',
      image: 'products/coleslaw.jpg',
    },

    // Beverages
    {
      id: 14,
      name: 'Iced Coffee',
      price: 593.0,
      category: 'Beverages',
      image: 'products/iced-coffee.jpg',
    },
    {
      id: 15,
      name: 'Coca Cola',
      price: 250.0,
      category: 'Beverages',
      image: 'products/coca-cola.jpg',
    },
    {
      id: 16,
      name: 'Orange Juice',
      price: 350.0,
      category: 'Beverages',
      image: 'products/orange-juice.jpg',
    },
    {
      id: 17,
      name: 'Milkshake',
      price: 550.0,
      category: 'Beverages',
      image: 'products/milkshake.jpg',
    },

    // Desserts
    {
      id: 18,
      name: 'Chocolate Brownie',
      price: 450.0,
      category: 'Desserts',
      image: 'products/chocolate-brownie.jpg',
    },
    {
      id: 19,
      name: 'Ice Cream Sundae',
      price: 550.0,
      category: 'Desserts',
      image: 'products/ice-cream.jpg',
    },
    {
      id: 20,
      name: 'Apple Pie',
      price: 400.0,
      category: 'Desserts',
      image: 'products/apple-pie.jpg',
    },
  ],

  orders: [
    {
      id: Date.now() - FIRST_ORDER_TIME_OFFSET,
      items: [
        {
          id: 1,
          name: 'Beef Whopper',
          price: 2050.85,
          category: 'Beef Burgers',
          image: 'products/beef-whopper.jpg',
          quantity: 2,
        },
        {
          id: 10,
          name: 'Thick Cut Fries',
          price: 559.32,
          category: 'Sides',
          image: 'products/fries.jpg',
          quantity: 1,
        },
      ],
      customer: {
        id: 2,
        name: 'Saman Perera',
        phone: '0711234567',
        email: 'saman.perera@email.com',
      },
      orderType: 'dine-in',
      subtotal: 4661.02,
      discountValue: 0,
      discountType: 'none',
      taxRate: 0,
      taxAmount: 0,
      total: 4661.02,
      amountReceived: 5000,
      changeDue: 338.98,
      paymentMethod: 'cash',
      status: 'completed',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - FIRST_ORDER_TIME_OFFSET).toISOString(),
    },
    {
      id: Date.now() - SECOND_ORDER_TIME_OFFSET,
      items: [
        {
          id: 8,
          name: 'Veggie Burger',
          price: 913.56,
          category: 'Veggie Burger',
          image: 'products/veggie-burger.jpg',
          quantity: 1,
        },
        {
          id: 14,
          name: 'Iced Coffee',
          price: 593.0,
          category: 'Beverages',
          image: 'products/iced-coffee.jpg',
          quantity: 2,
        },
      ],
      customer: {
        id: 3,
        name: 'Nimal Silva',
        phone: '0729876543',
        email: 'nimal.s@email.com',
      },
      orderType: 'takeaway',
      subtotal: 2099.56,
      discountValue: 100,
      discountType: 'flat',
      taxRate: 0,
      taxAmount: 0,
      total: 1999.56,
      amountReceived: 2000,
      changeDue: 0.44,
      paymentMethod: 'card',
      status: 'completed',
      paymentStatus: 'paid',
      timestamp: new Date(Date.now() - SECOND_ORDER_TIME_OFFSET).toISOString(),
    },
  ],
};

export default demoData;
