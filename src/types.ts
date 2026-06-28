export interface Artwork {
  id: string;
  title: string;
  artist: string;
  price: number; // in USD or EUR/ETH equivalent
  priceUnit: '€' | '$' | 'ETH';
  imageUrl: string;
  category: 'sculpture' | 'painting' | 'digital' | 'photography' | 'mixed media';
  isNewRelease?: boolean;
  series?: string;
  description: string;
  isAvailable: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  followersCount: number;
  worksCount: number;
  salesCount: number;
  bio: string;
  ownedArtIds: string[];
  favoriteArtIds: string[];
  isVerified: boolean;
  avatarUrl: string;
}

export interface OrderItem {
  artworkId: string;
  title: string;
  artist: string;
  price: number;
  priceUnit: string;
  imageUrl: string;
}

export interface Order {
  id: string;
  transactionHash: string;
  items: OrderItem[];
  subtotal: number;
  processingFee: number;
  total: number;
  walletAddress: string;
  name: string;
  email: string;
  paymentMethod: 'Connected Wallet' | 'Credit Card';
  status: 'pending' | 'confirmed' | 'delivered';
  createdAt: string;
}
