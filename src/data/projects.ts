export type Emirate = 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Fujairah' | 'Umm Al Quwain';

export const EMIRATES: Emirate[] = [
  'Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Sharjah', 'Ajman', 'Fujairah', 'Umm Al Quwain'
];

export const EMIRATE_AREAS: Record<Emirate, string[]> = {
  'Dubai': [
    'All Areas', 'Downtown Dubai', 'Business Bay', 'Dubai Marina', 'JBR', 'Palm Jumeirah', 'Emaar Beachfront', 
    'Dubai Creek Harbour', 'MBR City', 'Meydan', 'Dubai Hills Estate', 'JVC', 'JLT', 'JVT', 'Green Community', 
    'The Greens', 'The Views', 'Al Barari', 'Damac Hills', 'Damac Hills 2', 'Arabian Ranches', 'Arabian Ranches 2', 
    'Arabian Ranches 3', 'Town Square', 'Mudon', 'Remraam', 'Al Furjan', 'Discovery Gardens', 'Motor City', 
    'Sports City', 'Dubai Silicon Oasis', 'Dubailand', 'Jumeirah Golf Estates', 'Jumeirah Islands', 'Jumeirah Park', 
    'Jumeirah 2', 'EXPO City', 'Dubai South', 'Bluewaters Island', 'Emaar South', 'Villanova', 'Dubai Science Park', 'Dubai Investement Park', 'Dubai Production City', 'Dubai International City',
    'The Valley', 'Dubai Islands', 'Maritime City', 'Pearl Jumeirah', 'La Mer', 'Port De La Mer', 'Sobha Hartland', 'Zabeel',
    'Sobha Hartland 2', 'Nshama', 'Arjan', 'Liwan', 'International City', 'Silicon Oasis', 'Al Barsha', 'Umm Suqeim'
  ],
  'Abu Dhabi': [
    'All Areas', 'Al Reem Island', 'Yas Island', 'Saadiyat Island', 'Al Maryah Island', 'Al Raha Beach', 
    'Al Bandar', 'Al Muneera', 'Al Zeina', 'Khalifa City', 'Masdar City', 'Mohammed Bin Zayed City', 
    'Zayed City', 'Al Shamkha', 'Al Reef', 'Al Ghadeer', 'Jubail Island', 'Ramhan Island', 'Nurai Island', 
    'Saadiyat Lagoons', 'Bloom Living', 'Al Gurm', 'Hudayriat Island', 'Al Matar'
  ],
  'Sharjah': [
    'All Areas', 'Aljada', 'Masaar', 'Tilal City', 'Al Zahia', 'Muwaileh', 'Maryam Island', 
    'Sharjah Waterfront City', 'Al Majaz', 'Al Khan', 'Al Nahda', 'Al Qasimia', 'Al Taawun', 
    'Sun Island', 'Blue Bay', 'Al Juraina', 'Al Suyoh', 'Kalba', 'Khorfakkan'
  ],
  'Ajman': [
    'All Areas', 'Al Zorah', 'Ajman Downtown', 'Ajman Corniche', 'Emirates City', 'Al Jurf', 
    'Al Nuaimiya', 'Al Rashidiya', 'Mowaihat'
  ],
  'Ras Al Khaimah': [
    'All Areas', 'Al Marjan Island', 'Mina Al Arab', 'Al Hamra Village', 'RAK City', 'Al Dhait'
  ],
  'Fujairah': [
    'All Areas', 'Fujairah City', 'Al Aqah', 'Dibba', 'Al Faseel'
  ],
  'Umm Al Quwain': [
    'All Areas', 'UAQ Marina', 'Mistral', 'Al Salama'
  ]
};

export interface ProjectUnit {
  propertyType: string;
  beds: string;
  price: string;
}

export interface Project {
  id: string;
  name: string;
  description: string; // <-- Add your description here
  emirate: Emirate;
  area: string;
  startingPrice: string;
  handover: string;
  imageUrl: string; 
  developer: string;
  beds: string;
  priceAED?: number;
  totalAreaSqFt?: number;
  paymentPlan?: string;
  mapCoordinates: { lat: number; lng: number }; 
  isVerifiedAgent?: boolean;
  amenities?: string[];
  completionYear?: number | string;
  developerWebsite?: string;
  unitTypes?: ProjectUnit[];
  galleryUrls?: string[];
}

/**
 * ==========================================
 * ADD YOUR PROJECTS HERE MANUALLY
 * ==========================================
 * 
 * 1. DESCRIPTION & DETAILS: 
 *    Fill in the "description" field with your project details.
 *    You can also add "amenities" (an array of strings), "completionYear", 
 *    and a "developerWebsite" link to enrich the project profile.
 * 
 * 2. PICTURES (FOLDER):
 *    Upload your images directly into the "public/projects/[Project Name]/" folder.
 *    - Main Image: Name it "main.png"
 *    - Gallery: Name them "1.png", "2.png", "3.png", etc.
 *    The app will automatically find them if the folder name matches your "name" field.
 * 
 * 3. LOCATION (MAP LINKING):
 *    To pair the location, go to Google Maps, right-click on your exact 
 *    property location, copy the coordinates (e.g., 25.1972, 55.2744), 
 *    and paste them into the "mapCoordinates" field.
 */

export const PROJECTS: Project[] = [
  /* 
  UNCOMMENT THIS TEMPLATE AND COPY IT TO ADD YOUR PROJECTS:

  {
    id: 'project-1',
    name: 'Example Luxury Villa',
    description: 'A highly luxurious villa with panoramic sea views, direct beach access, private pool, and integrated smart-home features. Located in the heart of the community.',
    emirate: 'Dubai',
    area: 'Palm Jumeirah',
    startingPrice: 'AED 5,000,000',
    handover: 'Q4 2025',
    imageUrl: '/projects/example-villa.jpg', // <-- Put your picture in public/projects/
    developer: 'Example Developer Co.',
    beds: '4-5 BR',
    mapCoordinates: { lat: 25.1124, lng: 55.1390 }, // <-- Right click on Google Maps to get these numbers!
    isVerifiedAgent: true,
    amenities: ['Private Pool', 'Beach Access', 'Smart Home', 'Gym'],
    completionYear: 2025,
    developerWebsite: 'https://example-developer.com',
  }
  */
];
