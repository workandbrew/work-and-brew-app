// Sample data from the wireframe. Hours, ratings, and scout notes are placeholders.
// Shape mirrors the planned Supabase `cafes` table (see docs/BACKEND.md).

export const NEIGHBORHOODS = ['Crown Heights', 'East Village', 'Flatiron', "Hell's Kitchen"];

export const CAFES = [
  {
    id: 'koffee',
    name: 'Koffee',
    neighborhood: 'Crown Heights',
    borough: 'Brooklyn',
    distanceMi: 0.2,
    openUntil: '7 PM',
    rating: 4.8,
    scoutVerified: true,
    lat: 40.6716,
    lng: -73.9506,
    art: { palette: 'warm', mirror: false },
    photos: [],
    amenities: {
      wifi: 'Secure',
      outlets: 'Plenty, easy to find',
      seating: '8 to 12 seats',
      laptops: 'Welcome until 6 PM',
      restroom: 'In café',
      vibe: 'Quiet, natural light',
    },
    tags: ['wifi', 'outlets', 'seats8', 'restroom', 'quiet', 'light', 'calm', 'drinks', 'smallBiz', 'pocOwned'],
    highlights: ['Quiet', 'Outlets', 'Secure Wi-Fi'],
    scoutNote: '[Scout note for Koffee, from the visit.]',
  },
  {
    id: 'variety',
    name: 'Variety Coffee Roasters',
    neighborhood: "Hell's Kitchen",
    borough: 'Manhattan',
    distanceMi: 0.3,
    openUntil: '8 PM',
    rating: 4.6,
    scoutVerified: true,
    lat: 40.7627,
    lng: -73.9897,
    art: { palette: 'slate', mirror: true },
    photos: [],
    amenities: {
      wifi: 'Secure',
      outlets: 'A few, along the wall',
      seating: '20+ seats',
      laptops: 'Welcome all day',
      restroom: 'In café',
      vibe: 'Lively, big windows',
    },
    tags: ['wifi', 'seats8', 'restroom', 'lively', 'light', 'openLate', 'noLimit', 'laptopsLate', 'drinks', 'hotFood'],
    highlights: ['Big tables', 'Open late', 'Secure Wi-Fi'],
    scoutNote: '[Scout note for Variety Coffee Roasters, from the visit.]',
  },
  {
    id: 'birch',
    name: 'Birch Coffee',
    neighborhood: 'Flatiron',
    borough: 'Manhattan',
    distanceMi: 0.7,
    openUntil: '6 PM',
    rating: 4.5,
    scoutVerified: true,
    lat: 40.7425,
    lng: -73.9874,
    art: { palette: 'latte', mirror: false },
    photos: [],
    amenities: {
      wifi: 'Open network',
      outlets: 'Plenty, under the bench',
      seating: '8 to 12 seats',
      laptops: 'Welcome until 4 PM',
      restroom: 'Ask the barista',
      vibe: 'Calm, warm light',
    },
    tags: ['outlets', 'seats8', 'calm', 'quiet', 'drinks', 'hotFood', 'smallBiz'],
    highlights: ['Calm', 'Outlets'],
    scoutNote: '[Scout note for Birch Coffee, from the visit.]',
  },
  {
    id: 'partners',
    name: 'Partners Coffee',
    neighborhood: 'East Village',
    borough: 'Manhattan',
    distanceMi: 1.1,
    openUntil: '7 PM',
    rating: 4.7,
    scoutVerified: true,
    lat: 40.7268,
    lng: -73.9838,
    art: { palette: 'slate', mirror: false },
    photos: [],
    amenities: {
      wifi: 'Secure',
      outlets: 'Some, at the bar',
      seating: '12+ seats',
      laptops: 'Welcome on weekdays',
      restroom: 'In café',
      vibe: 'Calm energy, natural light',
    },
    tags: ['wifi', 'outlets', 'seats8', 'restroom', 'calm', 'light', 'noLimit', 'hotFood', 'drinks'],
    highlights: ['Natural light', 'Hot food'],
    scoutNote: '[Scout note for Partners Coffee, from the visit.]',
  },
];

// Café of the week editorial content.
export const FEATURE = {
  cafeId: 'koffee',
  label: 'Café of the week, Nov 2 to 8',
  photo: 'sample:feature', // test photo; leave null to show the illustration
  headline: "[Headline sentence on why Koffee is this week's pick.]",
  author: 'Work & Brew scouts',
  readMinutes: 3,
  space: "[Scout's take on the room: seating, light, and how it feels to settle in for a few hours.]",
  pullQuote: '[A short pull quote from the scout visit or the owner.]',
  order: '[Signature drink and food picks from the scout visit.]',
};

export const FILTER_GROUPS = [
  {
    key: 'work', title: 'Work', subtitle: "From each scout's visit",
    options: [
      { key: 'wifi', label: 'Secure Wi-Fi', icon: 'shield' },
      { key: 'outlets', label: 'Plenty of outlets', icon: 'plug' },
      { key: 'seats8', label: '8+ seats', icon: 'seat' },
      { key: 'restroom', label: 'Restroom', icon: 'restroom' },
    ],
  },
  {
    key: 'vibe', title: 'Vibe', subtitle: 'Noise, light, and energy',
    options: [
      { key: 'quiet', label: 'Quiet', icon: 'quiet' },
      { key: 'light', label: 'Natural light', icon: 'sun' },
      { key: 'calm', label: 'Calm energy' },
      { key: 'lively', label: 'Lively' },
    ],
  },
  {
    key: 'rules', title: 'Rules', subtitle: 'Laptop policies and time limits',
    options: [
      { key: 'laptopsLate', label: 'Laptops after 6 PM', icon: 'laptop' },
      { key: 'noLimit', label: 'No time limit', icon: 'timer' },
    ],
  },
  {
    key: 'food', title: 'Food', subtitle: 'Menus and ownership',
    options: [
      { key: 'hotFood', label: 'Hot food' },
      { key: 'drinks', label: 'Signature drinks' },
      { key: 'smallBiz', label: 'Small business' },
      { key: 'pocOwned', label: 'POC owned' },
    ],
  },
];

// Quick filters shown under the map search bar.
export const QUICK_FILTERS = [
  { key: 'quiet', label: 'Quiet', icon: 'quiet' },
  { key: 'outlets', label: 'Outlets', icon: 'plug' },
  { key: 'openLate', label: 'Open late', icon: 'moon' },
  { key: 'hotFood', label: 'Hot food', icon: 'food' },
  { key: 'seats8', label: 'Big tables', icon: 'seat' },
];

export const BOROUGHS = ['Bronx', 'Brooklyn', 'Manhattan', 'Queens', 'Staten Island'];
export const INTENTS = ['Study', 'Work remotely', 'Create', 'Read', 'Take calls', 'Meet up'];
export const NEEDS = ['Secure Wi-Fi', 'Outlets', 'Quiet', 'Open late', 'Hot food'];
export const INQUIRY_TOPICS = ['List my café', 'Partnership', 'Press', 'Other'];
export const ISSUE_TYPES = ['Wrong café info', 'App bug', 'Café closed', 'Other'];

// Eisenhower quadrants used by the Focus to-do list.
export const QUADRANTS = [
  { key: 'do', label: 'Do first', color: '#2C4A8A' },
  { key: 'schedule', label: 'Schedule', color: '#90ADC9' },
  { key: 'delegate', label: 'Delegate', color: '#5C4A3E' },
  { key: 'drop', label: 'Drop', color: '#5C4A3E', dashed: true },
];
