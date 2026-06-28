import { getStore } from '@netlify/blobs';
import { GoogleGenAI, Type } from '@google/genai';
import seedData from '../../data.json';
import type { Artwork, Order, UserProfile } from '../../src/types';

type Database = {
  artworks: Artwork[];
  users: UserProfile[];
  orders: Order[];
};

const store = getStore('curated-db');
const DATA_KEY = 'state';

const initialData = seedData as Database;

let aiClient: GoogleGenAI | null = null;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}

function cloneInitialData(): Database {
  return JSON.parse(JSON.stringify(initialData)) as Database;
}

async function loadDB(): Promise<Database> {
  const existing = await store.get(DATA_KEY, { type: 'json' }) as Database | null;
  if (existing) {
    return existing;
  }

  const fresh = cloneInitialData();
  await store.setJSON(DATA_KEY, fresh);
  return fresh;
}

async function saveDB(data: Database) {
  await store.setJSON(DATA_KEY, data);
}

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }

  return aiClient;
}

function getRoutePath(request: Request) {
  const url = new URL(request.url);
  return (url.searchParams.get('path') || '').replace(/^\/+/, '');
}

function getAuthEmail(request: Request) {
  return request.headers.get('authorization')?.replace('Bearer ', '') || 'avantika@curated.art';
}

export default async function handler(request: Request) {
  const routePath = getRoutePath(request);
  const method = request.method.toUpperCase();
  const body = method === 'GET' || method === 'HEAD' ? {} : await request.json().catch(() => ({}));
  const db = await loadDB();
  const parts = routePath.split('/').filter(Boolean);

  if (!routePath) {
    return json({ error: 'Missing API route.' }, 400);
  }

  if (method === 'GET' && routePath === 'artworks') {
    return json(db.artworks);
  }

  if (method === 'POST' && routePath === 'artworks') {
    const newArt: Artwork = {
      id: 'art-' + Date.now(),
      title: body.title || 'Untitled Artwork',
      artist: body.artist || 'Unknown Artist',
      price: Number(body.price) || 1000,
      priceUnit: body.priceUnit || '$',
      imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      category: body.category || 'digital',
      description: body.description || '',
      isAvailable: body.isAvailable !== false,
      isNewRelease: body.isNewRelease === true,
      series: body.series || ''
    };

    db.artworks.unshift(newArt);
    await saveDB(db);
    return json(newArt, 201);
  }

  if (method === 'PUT' && parts[0] === 'artworks' && parts[1]) {
    const index = db.artworks.findIndex((artwork) => artwork.id === parts[1]);
    if (index === -1) {
      return json({ error: 'Artwork not found' }, 404);
    }

    db.artworks[index] = {
      ...db.artworks[index],
      ...body
    };
    await saveDB(db);
    return json(db.artworks[index]);
  }

  if (method === 'DELETE' && parts[0] === 'artworks' && parts[1]) {
    db.artworks = db.artworks.filter((artwork) => artwork.id !== parts[1]);
    await saveDB(db);
    return json({ success: true });
  }

  if (method === 'POST' && routePath === 'auth/register') {
    const { email, firstName, lastName } = body;
    if (!email) {
      return json({ error: 'Email is required' }, 400);
    }

    const existing = db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
    if (existing) {
      return json({ error: 'User already exists' }, 400);
    }

    const newUser: UserProfile = {
      uid: 'user-' + Date.now(),
      email,
      firstName: firstName || 'Collector',
      lastName: lastName || 'Member',
      followersCount: 0,
      worksCount: 0,
      salesCount: 0,
      bio: 'New collector on CURATED art marketplace.',
      ownedArtIds: [],
      favoriteArtIds: [],
      isVerified: false,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
    };

    db.users.push(newUser);
    await saveDB(db);
    return json(newUser, 201);
  }

  if (method === 'POST' && routePath === 'auth/login') {
    const { email } = body;
    if (!email) {
      return json({ error: 'Email is required' }, 400);
    }

    const existingUser = db.users.find((user) => user.email.toLowerCase() === String(email).toLowerCase());
    if (!existingUser) {
      const fallbackUser: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        firstName: String(email).split('@')[0],
        lastName: '',
        followersCount: 0,
        worksCount: 0,
        salesCount: 0,
        bio: 'Art Collector & Admirer.',
        ownedArtIds: [],
        favoriteArtIds: [],
        isVerified: false,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
      };

      db.users.push(fallbackUser);
      await saveDB(db);
      return json(fallbackUser);
    }

    return json(existingUser);
  }

  if (method === 'GET' && routePath === 'auth/me') {
    const email = getAuthEmail(request);
    const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) || db.users[0];
    return json(user);
  }

  if (method === 'POST' && routePath === 'auth/profile/action') {
    const email = getAuthEmail(request);
    const userIndex = db.users.findIndex((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (userIndex === -1) {
      return json({ error: 'User not found' }, 404);
    }

    const { action, artworkId } = body;
    const user = db.users[userIndex];

    if (action === 'favorite') {
      if (!user.favoriteArtIds.includes(artworkId)) {
        user.favoriteArtIds.push(artworkId);
      }
    } else if (action === 'unfavorite') {
      user.favoriteArtIds = user.favoriteArtIds.filter((id) => id !== artworkId);
    } else if (action === 'own') {
      if (!user.ownedArtIds.includes(artworkId)) {
        user.ownedArtIds.push(artworkId);
      }
    }

    db.users[userIndex] = user;
    await saveDB(db);
    return json(user);
  }

  if (method === 'GET' && routePath === 'orders') {
    return json(db.orders);
  }

  if (method === 'POST' && routePath === 'orders') {
    const { name, email, walletAddress, paymentMethod, items, subtotal, processingFee, total } = body;

    const newOrder: Order = {
      id: 'CR-' + Math.floor(100000 + Math.random() * 900000),
      transactionHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      items: items || [],
      subtotal: subtotal || 0,
      processingFee: processingFee || 0,
      total: total || 0,
      walletAddress: walletAddress || '0xLocalWalletKey...',
      name: name || 'Anonymous Collector',
      email: email || 'anonymous@curated.com',
      paymentMethod: paymentMethod || 'Connected Wallet',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    db.orders.push(newOrder);

    const userIndex = db.users.findIndex((entry) => entry.email.toLowerCase() === String(email || '').toLowerCase());
    if (userIndex !== -1) {
      newOrder.items.forEach((item: { artworkId: string }) => {
        if (!db.users[userIndex].ownedArtIds.includes(item.artworkId)) {
          db.users[userIndex].ownedArtIds.push(item.artworkId);
        }
      });
    }

    newOrder.items.forEach((item: { artworkId: string }) => {
      const artIdx = db.artworks.findIndex((artwork) => artwork.id === item.artworkId);
      if (artIdx !== -1) {
        db.artworks[artIdx].isAvailable = false;
      }
    });

    await saveDB(db);
    return json(newOrder, 201);
  }

  if (method === 'PUT' && parts[0] === 'orders' && parts[1] && parts[2] === 'status') {
    const index = db.orders.findIndex((order) => order.id === parts[1]);
    if (index === -1) {
      return json({ error: 'Order not found' }, 404);
    }

    db.orders[index].status = body.status || 'confirmed';
    await saveDB(db);
    return json(db.orders[index]);
  }

  if (method === 'POST' && routePath === 'recommendations') {
    const client = getGeminiClient();
    const { userBio, favoriteCategories, cartItems, ownedArtTitles } = body;

    const artworksContext = db.artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      category: artwork.category,
      price: `${artwork.priceUnit}${artwork.price}`,
      description: artwork.description
    }));

    if (!client) {
      const categories = favoriteCategories || ['digital', 'sculpture'];
      const filteredRecommendations = db.artworks.filter((artwork) =>
        categories.includes(artwork.category) && !ownedArtTitles?.includes(artwork.title)
      ).slice(0, 3);

      return json({
        curatorSpeech: 'I have curated these works especially for you. Based on your love for deep architectural lines and generative mediums, these selections balance physical presence with digital weightlessness. They fit perfectly into the contemporary ethos you appreciate.',
        recommendedArtworkIds: filteredRecommendations.map((artwork) => artwork.id)
      });
    }

    try {
      const prompt = `You are the lead curator for CURATED (The Sovereign Art Collective), an ultra-exclusive high-end modern art platform.
Analyze the following collector profile and recommend 2 to 3 artworks from our catalog.

Collector Profile:
- Bio: "${userBio || 'Sophisticated digital collector'}"
- Favorite Categories: ${JSON.stringify(favoriteCategories || [])}
- Currently in Cart: ${JSON.stringify(cartItems || [])}
- Already Owns: ${JSON.stringify(ownedArtTitles || [])}

Available Catalog:
${JSON.stringify(artworksContext, null, 2)}

Provide a reply in strict JSON matching the following schema:
{
  "curatorSpeech": "A personalized, poetic, highly sophisticated and expert critique explanation of why these works fits the collector's taste (2 sentences, elegant and museum-level language)",
  "recommendedArtworkIds": ["id1", "id2", "id3"]
}
`;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              curatorSpeech: { type: Type.STRING, description: 'Poetic explanation for the recommendations' },
              recommendedArtworkIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of recommended artwork IDs from the catalog'
              }
            },
            required: ['curatorSpeech', 'recommendedArtworkIds']
          }
        }
      });

      const resultText = response.text ? response.text.trim() : '{}';
      return json(JSON.parse(resultText));
    } catch (error) {
      console.error('Gemini Recommendation Error:', error);
      return json({
        curatorSpeech: 'An exquisite curation focusing on structural minimalism and organic digital fluids. Recommended for your exquisite taste.',
        recommendedArtworkIds: ['art-1', 'art-6', 'art-10']
      });
    }
  }

  return json({ error: `Unsupported route: ${method} ${routePath}` }, 404);
}