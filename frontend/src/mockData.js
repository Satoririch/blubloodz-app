export const mockBreeders = [
  {
    id: 'breeder-1',
    name: 'Marcus Romano',
    location: 'Austin, TX',
    breeds: ['Cane Corso'],
    trustScore: 94,
    verified: true,
    bio: 'Champion bloodline specialist with 15+ years breeding elite Cane Corsos. Every dog is health tested through OFA and DNA verified.',
    avatar: 'https://images.unsplash.com/photo-1632772341241-51e975ae8f65?crop=entropy&cs=srgb&fm=jpg&q=85',
    badges: ['OFA Verified', 'DNA Tested', 'Pedigree Confirmed'],
    totalLitters: 12,
    activeLitters: 1,
    reviews: [
      { id: 1, author: 'Sarah M.', rating: 5, text: 'Best breeder I\'ve worked with. Our Corso is healthy, well-socialized, and exactly as described.', date: '2024-01-15' },
      { id: 2, author: 'James K.', rating: 5, text: 'Marcus is incredibly transparent about health testing and pedigree. Worth every penny.', date: '2024-02-20' }
    ]
  },
  {
    id: 'breeder-2',
    name: 'Elite French Bulldogs Co.',
    location: 'Miami, FL',
    breeds: ['French Bulldog'],
    trustScore: 88,
    verified: true,
    bio: 'Specializing in rare color French Bulldogs with championship pedigrees. All puppies come with health guarantees.',
    avatar: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?crop=entropy&cs=srgb&fm=jpg&q=85',
    badges: ['OFA Verified', 'DNA Tested'],
    totalLitters: 8,
    activeLitters: 1,
    reviews: [
      { id: 1, author: 'Amanda R.', rating: 5, text: 'Beautiful Frenchie! Great communication throughout the process.', date: '2024-03-10' }
    ]
  },
  {
    id: 'breeder-3',
    name: 'Blue Mountain Kennels',
    location: 'Denver, CO',
    breeds: ['American Bully', 'Exotic Bully'],
    trustScore: 67,
    verified: false,
    bio: 'Breeding compact, muscular American and Exotic Bullies with excellent temperaments.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&q=85',
    badges: ['DNA Tested'],
    totalLitters: 5,
    activeLitters: 0,
    reviews: []
  }
];

export const mockDogs = [
  {
    id: 'dog-1',
    breederId: 'breeder-1',
    name: 'Caesar',
    breed: 'Cane Corso',
    age: '4 years',
    weight: '120 lbs',
    registrationNumber: 'AKC-WS78945612',
    images: [
      'https://images.unsplash.com/photo-1688482308921-76d1645cd15a?crop=entropy&cs=srgb&fm=jpg&q=85',
      'https://images.unsplash.com/photo-1718609737695-54c04010442b?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    healthTests: [
      { name: 'OFA Hips', status: 'verified', result: 'Good', date: '2023-06-15' },
      { name: 'OFA Elbows', status: 'verified', result: 'Normal', date: '2023-06-15' },
      { name: 'Cardiac', status: 'verified', result: 'Clear', date: '2023-07-20' },
      { name: 'Eyes', status: 'verified', result: 'Clear', date: '2023-07-20' },
      { name: 'DNA Panel', status: 'verified', result: 'Clear', date: '2023-08-10' }
    ],
    pedigree: {
      sire: { name: 'Titan of Rome', registration: 'AKC-WS65432198' },
      dam: { name: 'Bella Regina', registration: 'AKC-WS67854321' }
    }
  },
  {
    id: 'dog-2',
    breederId: 'breeder-1',
    name: 'Luna',
    breed: 'Cane Corso',
    age: '3 years',
    weight: '105 lbs',
    registrationNumber: 'AKC-WS79856234',
    images: [
      'https://images.unsplash.com/photo-1650427222463-1090ab5dc6a9?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    healthTests: [
      { name: 'OFA Hips', status: 'verified', result: 'Excellent', date: '2023-09-12' },
      { name: 'OFA Elbows', status: 'verified', result: 'Normal', date: '2023-09-12' },
      { name: 'Cardiac', status: 'verified', result: 'Clear', date: '2023-10-05' },
      { name: 'Eyes', status: 'verified', result: 'Clear', date: '2023-10-05' },
      { name: 'DNA Panel', status: 'verified', result: 'Clear', date: '2023-10-20' }
    ],
    pedigree: {
      sire: { name: 'Maximus', registration: 'AKC-WS68745123' },
      dam: { name: 'Sophia', registration: 'AKC-WS69874512' }
    }
  },
  {
    id: 'dog-3',
    breederId: 'breeder-2',
    name: 'Pierre',
    breed: 'French Bulldog',
    age: '2 years',
    weight: '28 lbs',
    registrationNumber: 'AKC-NP85674321',
    images: [
      'https://images.unsplash.com/photo-1723984731151-6f650af3bbe7?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    healthTests: [
      { name: 'OFA Hips', status: 'verified', result: 'Good', date: '2024-01-10' },
      { name: 'Cardiac', status: 'verified', result: 'Clear', date: '2024-01-15' },
      { name: 'Eyes', status: 'verified', result: 'Clear', date: '2024-01-15' },
      { name: 'DNA Panel', status: 'verified', result: 'Clear', date: '2024-02-01' },
      { name: 'Patella', status: 'pending', result: 'Pending', date: null }
    ],
    pedigree: {
      sire: { name: 'Napoleon', registration: 'AKC-NP82345678' },
      dam: { name: 'Coco', registration: 'AKC-NP83456789' }
    }
  },
  {
    id: 'dog-4',
    breederId: 'breeder-2',
    name: 'Bella',
    breed: 'French Bulldog',
    age: '3 years',
    weight: '24 lbs',
    registrationNumber: 'AKC-NP86785432',
    images: [
      'https://images.pexels.com/photos/10497109/pexels-photo-10497109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
    ],
    healthTests: [
      { name: 'OFA Hips', status: 'verified', result: 'Fair', date: '2023-11-20' },
      { name: 'Cardiac', status: 'verified', result: 'Clear', date: '2023-12-05' },
      { name: 'DNA Panel', status: 'pending', result: 'In Progress', date: null },
      { name: 'Eyes', status: 'missing', result: 'Not Done', date: null },
      { name: 'Patella', status: 'missing', result: 'Not Done', date: null }
    ],
    pedigree: {
      sire: { name: 'Duke', registration: 'AKC-NP84567890' },
      dam: { name: 'Princess', registration: 'AKC-NP85678901' }
    }
  },
  {
    id: 'dog-5',
    breederId: 'breeder-3',
    name: 'Hercules',
    breed: 'American Bully',
    age: '2 years',
    weight: '85 lbs',
    registrationNumber: 'ABKC-AB12345678',
    images: [
      'https://images.unsplash.com/photo-1568572933382-74d440642117?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    healthTests: [
      { name: 'DNA Panel', status: 'verified', result: 'Clear', date: '2024-01-05' },
      { name: 'OFA Hips', status: 'missing', result: 'Not Done', date: null },
      { name: 'OFA Elbows', status: 'missing', result: 'Not Done', date: null },
      { name: 'Cardiac', status: 'missing', result: 'Not Done', date: null },
      { name: 'Eyes', status: 'missing', result: 'Not Done', date: null }
    ],
    pedigree: {
      sire: { name: 'Thor', registration: 'ABKC-AB11223344' },
      dam: { name: 'Athena', registration: 'ABKC-AB11223355' }
    }
  },
  {
    id: 'dog-6',
    breederId: 'breeder-3',
    name: 'Bella Blue',
    breed: 'Exotic Bully',
    age: '1.5 years',
    weight: '55 lbs',
    registrationNumber: 'ABKC-EB87654321',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    healthTests: [
      { name: 'DNA Panel', status: 'verified', result: 'Clear', date: '2024-02-10' },
      { name: 'OFA Hips', status: 'pending', result: 'In Progress', date: null },
      { name: 'Cardiac', status: 'missing', result: 'Not Done', date: null },
      { name: 'Eyes', status: 'missing', result: 'Not Done', date: null },
      { name: 'Patella', status: 'missing', result: 'Not Done', date: null }
    ],
    pedigree: {
      sire: { name: 'King Kong', registration: 'ABKC-EB98765432' },
      dam: { name: 'Diamond', registration: 'ABKC-EB98765433' }
    }
  }
];

export const mockLitters = [
  {
    id: 'litter-1',
    breederId: 'breeder-1',
    sireId: 'dog-1',
    damId: 'dog-2',
    breed: 'Cane Corso',
    expectedDate: '2024-05-15',
    status: 'upcoming',
    puppyCount: 8,
    priceRange: '$3,500 - $5,500',
    availableCount: 8,
    description: 'Exceptional litter from champion bloodlines. Both parents have full health clearances and excellent temperaments.',
    images: [
      'https://images.unsplash.com/photo-1760204472190-ec9191b6af5c?crop=entropy&cs=srgb&fm=jpg&q=85'
    ],
    puppies: []
  },
  {
    id: 'litter-2',
    breederId: 'breeder-2',
    sireId: 'dog-3',
    damId: 'dog-4',
    breed: 'French Bulldog',
    birthDate: '2024-03-10',
    status: 'available',
    puppyCount: 5,
    priceRange: '$4,500 - $7,500',
    availableCount: 2,
    description: 'Beautiful rare color Frenchie puppies ready for their forever homes. All puppies are vet checked and come with health guarantees.',
    images: [
      'https://images.unsplash.com/photo-1760210043126-f185b4d16c58?crop=entropy&cs=srgb&fm=jpg&q=85',
      'https://images.pexels.com/photos/10497109/pexels-photo-10497109.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940'
    ],
    puppies: [
      { id: 'pup-1', name: 'Blue Boy', gender: 'Male', color: 'Blue Fawn', status: 'sold', price: '$6,500' },
      { id: 'pup-2', name: 'Lilac Girl', gender: 'Female', color: 'Lilac', status: 'reserved', price: '$7,500' },
      { id: 'pup-3', name: 'Fawn Boy', gender: 'Male', color: 'Fawn', status: 'available', price: '$4,500' },
      { id: 'pup-4', name: 'Blue Girl', gender: 'Female', color: 'Blue', status: 'reserved', price: '$7,000' },
      { id: 'pup-5', name: 'Cream Boy', gender: 'Male', color: 'Cream', status: 'available', price: '$5,500' }
    ]
  }
];

export const mockInquiries = [
  {
    id: 'inq-1',
    litterId: 'litter-2',
    buyerName: 'Jennifer Wilson',
    buyerEmail: 'jennifer.w@email.com',
    message: 'Interested in the Fawn Boy. Is he still available?',
    date: '2024-04-20',
    status: 'pending'
  },
  {
    id: 'inq-2',
    litterId: 'litter-1',
    buyerName: 'Michael Chen',
    buyerEmail: 'michael.c@email.com',
    message: 'Would like to reserve a male puppy from the upcoming litter. What is the deposit?',
    date: '2024-04-18',
    status: 'pending'
  }
];