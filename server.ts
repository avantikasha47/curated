import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), 'data.json');

// Types & Interfaces
import type { Artwork, UserProfile, Order } from './src/types';

// Initial Seed Data matching the pixel-perfect mockups
const DEFAULT_ARTWORKS: Artwork[] = [
  {
    id: 'art-1',
    title: 'Ether Monolith 01',
    artist: 'Julian Arthe',
    price: 4200,
    priceUnit: '€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdI4SBhzKsit90jpRX_I8O9helltRlsK_nxJAgFMqOCP0LrtSfbrJsgiISqDasPWBUJRG_ks2ikNTUNiXl6Mqtb7fnDsBsRq2i18L1KR1BL_thxGuThskM4YSjG1wb457H_VnOQEk7CrW_dnkMIA5CAtdhLVfv_-0gulQgngNw27WlEnHN9RlQIFix9ZSYIEYBNIa2qnKzW_Ib7-8BXtmEdipY0cccRYQySuBs-Oq_0gFMWepGuy0h-bJZW-zDiPT1ANCxbX-_jliL',
    category: 'sculpture',
    description: 'A minimalist architectural photography piece showing clean concrete lines against a bright, clear blue sky. The composition is highly geometric and editorial, reflecting the light-mode aesthetic of a premium art gallery.',
    isAvailable: true
  },
  {
    id: 'art-2',
    title: 'Void Study',
    artist: 'Julian Arthe',
    price: 1500,
    priceUnit: '€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwcdyb9jgPlT251-OtD3z7NxustuhyP7noYggPOoc-1yEPVulWGZ8fEsGnsvDciO7I6P7YkQTfJytl75bpQreYlKzkTyMryZD_ZFRAML2jWEQ7VCAmEyxekZxVWloeQqJDLUwnCqqoKvknoNvA9Y4z03aeVZzThvLXkf0xC6c4r2htaA5GZlIO0Mux3zu815NfroSSCY6i8Mcc50LLNOmzvPAZRUULBhJ4ZbUmAoVW8OtbIQ-lDK1qk4R43Ei-Sv4Obqg68B3moaxC',
    category: 'digital',
    description: 'Abstract digital painting with flowing, liquid-like shapes in shades of pearl white, soft charcoal, and a single striking accent of electric violet. The textures look like premium silk suspended in zero gravity.',
    isAvailable: true
  },
  {
    id: 'art-3',
    title: 'Symmetry III',
    artist: 'Julian Arthe',
    price: 2400,
    priceUnit: '€',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBX_V4aEScLwPeATyefdn6i6Qr0nirQz25FgZ-yi3AsbuG-pJFHF8HpjU9JSasf-DuWltyJ68EeOZ7DwAMv3cttJE7X8PXt0mp35dbV1sZ83fMPJbVFgnUcjdct8RHke_DBaC_gGKI8kWRXuFTj61heBU5bClsWGPUc53wBwYV9BFkaUZvQe5X3n1LdV6dLSUCH-UaHsVU9k6rihgQzwJz-oGAikBW6SliOJ3edB712aCV59HM9wg0qXUYlMDKhrIH-dBeQzQJiVAQa',
    category: 'sculpture',
    description: 'Minimalist high-contrast portrait of a stone sculpture with intricate, fine details. The lighting is stark and directional, creating deep charcoal shadows against a bright cream background.',
    isAvailable: true
  },
  {
    id: 'art-4',
    title: 'Celestial Echoes',
    artist: 'Elias Thorne',
    price: 4200,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAnuoe3wATuPG6a-twKO1si8FPXRMCwWYuHwy8FTZYvOkZFI8B3Gi2yHLmrf4nYg8jszuj5GiktZEQVL7ik2XaBczz3Y2TRx5W83hvVTsWWN3cfzibvd95hHunIAFto-2__L_U3-mp7-LBdPRVPQ5-RxuX3dw0sPR7Adzo_7LdRtfy9dz3l3kv9LFLnqn5iRmbC4FvcDNVOL3bK8Q9mGaGYfZ6WMsfd_GE00ZVRwGGreGz-LDA30kMgd-nF7HI9pB1jMJtVpUkkFwnD',
    category: 'painting',
    description: 'A minimalist oil painting on a large canvas featuring sweeping, ethereal white and charcoal grey strokes. The composition is balanced and serene, with a soft matte texture reflecting high-end gallery lighting.',
    isAvailable: true
  },
  {
    id: 'art-5',
    title: 'Obsidian Void',
    artist: 'Aara Kim',
    price: 8500,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRhlkl1zwcwpWhr2DzHBT_sdy3GO3pD90SC8wRKXrK-KxocJt2VrszR5AK5DCTW53Nq9vytJmiezWuJEWC2-G_KlGJUB16CYQ00xZmsTRhWITdQMDT_VvjgWj4ioKDPSfnmEt1jwEPMW6gNy2EqVtfQpUowTCR94Vx_8NIR7N8c_7a_ULQcKSMkjzVIlXau-njMECDU-VGc84kFVd4i4CeZIsRNYLEIHa0QMvDh59KvuRq07hBgH2DMO9Yv9KE499Q35ZOChw2eeTq',
    category: 'sculpture',
    description: 'A modern geometric sculpture made of polished obsidian and frosted glass, standing in a brightly lit, minimalist white studio. The sculpture features sharp angles and smooth curves.',
    isAvailable: true
  },
  {
    id: 'art-6',
    title: 'Neon Drift',
    artist: 'System-X',
    price: 1800,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgLiovSBef-HskDcFYqHe4Sa35OkQey1ljDqj2GXDtkdVHkdvufZ9MkPRTmblYAxi7shwnDO9Hd0O3MlaAr8I4QlyO-PDaekOs_yVuS6qEwApNsGw_tLxIc6mHVhbxsRwvWKa3gwo-Li8BUnYsj32IWNw8-LNIsYZ9Jp3JT-ErGFpilE0ms-21xUy8QsTv08Vxmo8caca7QtEHANBvBTCicQKfFxAPtqyVxJ5h7k0Qnn6eoRaknC9TY0lMb35qAZl_D0ri5f1qnS7P',
    category: 'digital',
    isNewRelease: true,
    description: 'A vibrant digital art piece showcasing fluid, generative patterns in electric violet and deep charcoal black. The artwork feels luminous and three-dimensional, like a captured digital aurora.',
    isAvailable: true
  },
  {
    id: 'art-7',
    title: 'Silence of the Dune',
    artist: 'Marcus Vance',
    price: 2900,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIBEA7coC1npyd0HBqSYhp4VnBjQQe0hVaLRm3EdnJnghzGfx_2xwjDiggUckprOXusHbv1xmOezHpX0KGJS79Xkg8rhX0UdjFup9nEnYKjkz1LfHrP_g5cfBmld3JuzFKWUcu9EtIKUFa8665sceCXevac4zybRyM2Ct8WQlLjpn1dsU_7woIIhhA4_hKZyZjpzmITZhd7kKt8ZpQOM4jj20ymYa0vS0rkSp0-HHIjPl-XPiWIlibiJzJK9FP9bWl_tPRH0_Mannt',
    category: 'photography',
    description: 'A large-format fine art photograph of a minimalist desert landscape under a pale blue morning sky. The sand dunes create rhythmic, soft curves and sharp shadows.',
    isAvailable: true
  },
  {
    id: 'art-8',
    title: 'Organic Forms No. 7',
    artist: 'Sienna Cole',
    price: 1200,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcevOcA-2Kq-VeC_l1EhROqmCM50jvI3WZNCctDwyEgqLQEGH500jWlhYnQqwr52OAeOIKNdWIpGneuCNi2eUWal6eL7NDKqZrfzEzSg7_BdY4vhJ13AV57V-iWMHItVOe7k3gfY0fhmlDFp-Wqm7XHxbFWAzDEfeSIT4MyjkzQAWZNK_3W1j4DMTbiCj7EP413d25Tc5XgolwRvxxlGxCTtMkYVzerruF7kTXLf-KFmAp4hrvnS_V6aXHRm4agpzBgSDXskoYTcjD',
    category: 'sculpture',
    description: 'A set of three modern ceramic vases with irregular, organic shapes and a rough stone-like texture. Displayed on a white marble plinth.',
    isAvailable: true
  },
  {
    id: 'art-9',
    title: 'Fragmented Memory',
    artist: 'Julianne Hart',
    price: 3600,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH-VS7stD3YNZYDsNtaXfG2b40aQmJNn63HPPkL5CV36rGTWCi0a2vz0lRLmhSTNt13_C8jrItsGaogThOTt9WYKRmMp_7e1wekUwpHcRkETcSWDXA1WPlYzqTT6w8p70k9QVaIGgYQ3ZG1FitHFan45UMOHKzo8t6B6xs-UyNsApEs4BaHGa9QeElmtqhOTDxuW1d6iZREpzqfA4R54ceUC9WJAZ-cFvk1QGSfqbga7q9CVnm-pNcFXLcEf7xPoo28YDKDc9rDjNn',
    category: 'mixed media',
    description: 'An abstract mixed media piece featuring layers of torn paper, charcoal sketches, and subtle gold leaf accents.',
    isAvailable: true
  },
  {
    id: 'art-10',
    title: 'Spatial Echoes I',
    artist: 'Elena Voss',
    price: 2500,
    priceUnit: 'ETH',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSbeHD92Skg6xgV6Ydfqnxgk2CNGtMfzPImrnDX-ufT8QJARiJNRdNTi-K5p1xmP3IYLwi8io0_zfaeBk-n7oLMn6wNHFDq1Wu961qg24jhBEK5f3M3shBiBtiCPFxnkwFh-yJfpcJwwtD0PWeDiAkrNn_i6rLBvmk_x8cOkLnSwVLebpCESn-uILT8rzpWCRy5RLyU0RfN98yG6g_rDa7i7dn0tjtqC5NYduoFWwwDpmgqZBBvb7PN3V9NTeNOx4qy8qLaF1bKNLB',
    category: 'digital',
    series: 'The Void',
    description: 'A sophisticated digital artwork showing ethereal, translucent layers of violet and charcoal grey light shifting through a void.',
    isAvailable: true
  },
  {
    id: 'art-11',
    title: 'Monolith Study',
    artist: 'Elena Voss',
    price: 3100,
    priceUnit: 'ETH',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtOtJ_iYJHcM3XDtjyyDWad3EcADNYqzmXeK61c_xVs_sf8t19W7O53XawgneNn_JVwt3t_LTDLeWhus8smWqZN-KEbxop3KmeEJKBuxSNHnb5yO4oqRZ2V47XyKuEpTqXk2IzSai3E69cdEY35uTK3CB4TXQ4jIMT9jnEQiazilqGdbE_QXyDIFYdE5K5YqU5J-ypGhvC48ZZbE0Q92KteXsyDbw7EghiTFOa7dmhxzgQsMxwtNnZOEZukdtRAG_UiNR9yLFA2Wvl',
    category: 'sculpture',
    series: 'Structures',
    description: 'Minimalist art piece featuring sharp geometric forms in stark black and muted cream. Soft shadows provide depth against a neutral background.',
    isAvailable: true
  },
  {
    id: 'art-12',
    title: 'Fluidity Alpha',
    artist: 'Elena Voss',
    price: 1900,
    priceUnit: 'ETH',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDes9Bgl5Y--PofRYn16N2DvW1JljY6eXBGLMtmmAca3cx8X__fP62UnQuyEzjwWP8H6s2EFdJ_kkzMJEUc4k-5z4EkfdOb1EhV3bIFIa77g5AQ27VS6-v-5K_X70CkLm5TmBrgJElSAY3dw0s7SGZBCYDvL7WfaRmOyFNNukvj2wp0DN0kGSmwlszoaizmQstQsj-TUJBK1s456sLKmsSzINxB8yQq89z9vjUY-aKaQe_4xdw8s1DhqwdosWSY8U-c2MRWdMgqQVfm',
    category: 'digital',
    series: 'Motion',
    description: 'Generative digital art displaying flowing, organic white ribbons against a charcoal-grey background.',
    isAvailable: true
  },
  {
    id: 'art-13',
    title: 'Prism Theory',
    artist: 'Marcus Thorne',
    price: 3300,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjbrcyVepptoSrEO2cwamUtGJgyTGMo69mIwlRpTFWaAwsHPWq1t1Lm_y0rlXgs2ylRQRbH3cIx04D9NI0WXe_jcA8FhKkdI8nx9F-UJJni7ItTLFF2p1gNjrIiXl_ctb5Hke3HeQQ9YirWa1pwEjPJ6EeH5LQ4lBsZeG8K0K0zxBfxOGm9Xzfz0pGCZSdWDvhMBeIqCEvW-VhpAiiIjPXQCuYQNFvKp56kYMcHWTWpvQ1jsVGLxD2EWgNWWdUKJKQS3PES6J1SpM5',
    category: 'sculpture',
    description: 'A bright, high-key digital rendering of a glass sculpture refracting light into a spectrum of soft violet and muted grey tones.',
    isAvailable: true
  },
  {
    id: 'art-14',
    title: 'The Red Focus',
    artist: 'Sarah Chen',
    price: 4900,
    priceUnit: '$',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDM-Jp-yC9-DrmDn_vKaTtCBe0LnbbieIRsTvJFAtR_z2FBtrZAMo2G-2lX53tVgD0rkKBp4APlIaYLRxG-Fc_cPOsyOuOUqOf3ia9zv-__OuRrWxrXfVcrdIKcpOt0zNpeb3JJxXc604_7lcXKrW9lABHZDtO_9dkgINJFTn5g6EtaQ3KPCm4W8QLLUa2b-pxOIHWpiirGE1yaUfX4E4CQukdo7xM4_MMKqGWCpqowONivhN3YKeTnIOYA5KbR3NpVNXAzBevIMbeX',
    category: 'painting',
    description: 'A high-contrast editorial art piece with a single red circle floating above a complex field of black and white geometric patterns.',
    isAvailable: true
  }
];

// DEFAULT Profile for Avantika Sharma
const DEFAULT_USER: UserProfile = {
  uid: 'avantika-sharma',
  email: 'avantika@curated.art',
  firstName: 'Avantika',
  lastName: 'Sharma',
  followersCount: 12400,
  worksCount: 84,
  salesCount: 152,
  bio: 'Avantika Sharma is a contemporary artist shaping quiet, architectural compositions through digital and mixed-media practice. Her work explores material memory, spatial tension, and restrained emotion with a refined gallery sensibility.',
  ownedArtIds: ['art-10', 'art-11', 'art-12'],
  favoriteArtIds: ['art-13', 'art-14'],
  isVerified: true,
  avatarUrl: '/assets/profile-photo.jpeg'
};

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'CR-882910',
    transactionHash: '0x8a2f3a9d7b4e5c1f91c3d0b2a5e8c1f90a1b2c3d',
    items: [
      {
        artworkId: 'art-1',
        title: 'Ether Monolith 01',
        artist: 'Julian Arthe',
        price: 4200,
        priceUnit: '€',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdI4SBhzKsit90jpRX_I8O9helltRlsK_nxJAgFMqOCP0LrtSfbrJsgiISqDasPWBUJRG_ks2ikNTUNiXl6Mqtb7fnDsBsRq2i18L1KR1BL_thxGuThskM4YSjG1wb457H_VnOQEk7CrW_dnkMIA5CAtdhLVfv_-0gulQgngNw27WlEnHN9RlQIFix9ZSYIEYBNIa2qnKzW_Ib7-8BXtmEdipY0cccRYQySuBs-Oq_0gFMWepGuy0h-bJZW-zDiPT1ANCxbX-_jliL'
      },
      {
        artworkId: 'art-6',
        title: 'Neon Drift',
        artist: 'System-X',
        price: 1800,
        priceUnit: '$',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgLiovSBef-HskDcFYqHe4Sa35OkQey1ljDqj2GXDtkdVHkdvufZ9MkPRTmblYAxi7shwnDO9Hd0O3MlaAr8I4QlyO-PDaekOs_yVuS6qEwApNsGw_tLxIc6mHVhbxsRwvWKa3gwo-Li8BUnYsj32IWNw8-LNIsYZ9Jp3JT-ErGFpilE0ms-21xUy8QsTv08Vxmo8caca7QtEHANBvBTCicQKfFxAPtqyVxJ5h7k0Qnn6eoRaknC9TY0lMb35qAZl_D0ri5f1qnS7P'
      }
    ],
    subtotal: 6000,
    processingFee: 15,
    total: 6015,
    walletAddress: '0x8a2f3a9d7b4e5c1f91c3d0b2a5e8c1f90a1b2c3d',
    name: 'Avantika Sharma',
    email: 'avantika@curated.art',
    paymentMethod: 'Connected Wallet',
    status: 'confirmed',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Read/Write DB helper
function loadDB() {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      artworks: DEFAULT_ARTWORKS,
      users: [DEFAULT_USER],
      orders: DEFAULT_ORDERS
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading DB:', error);
    return {
      artworks: DEFAULT_ARTWORKS,
      users: [DEFAULT_USER],
      orders: DEFAULT_ORDERS
    };
  }
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

// Lazy Initialize Gemini SDK to protect against start-up crashes
let aiClient: GoogleGenAI | null = null;
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

// Main server launcher
async function startServer() {
  const app = express();
  app.use(express.json());

  // API Endpoints: Database Management

  // Get Artworks
  app.get('/api/artworks', (req, res) => {
    const db = loadDB();
    res.json(db.artworks);
  });

  // Create Artwork (Dynamic Content Management / CMS)
  app.post('/api/artworks', (req, res) => {
    const db = loadDB();
    const newArt: Artwork = {
      id: 'art-' + Date.now(),
      title: req.body.title || 'Untitled Artwork',
      artist: req.body.artist || 'Unknown Artist',
      price: Number(req.body.price) || 1000,
      priceUnit: req.body.priceUnit || '$',
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800',
      category: req.body.category || 'digital',
      description: req.body.description || '',
      isAvailable: req.body.isAvailable !== false,
      isNewRelease: req.body.isNewRelease === true,
      series: req.body.series || ''
    };
    db.artworks.unshift(newArt);
    saveDB(db);
    res.status(201).json(newArt);
  });

  // Update Artwork
  app.put('/api/artworks/:id', (req, res) => {
    const db = loadDB();
    const index = db.artworks.findIndex((a: Artwork) => a.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Artwork not found' });
    }
    db.artworks[index] = {
      ...db.artworks[index],
      ...req.body
    };
    saveDB(db);
    res.json(db.artworks[index]);
  });

  // Delete Artwork
  app.delete('/api/artworks/:id', (req, res) => {
    const db = loadDB();
    const filtered = db.artworks.filter((a: Artwork) => a.id !== req.params.id);
    db.artworks = filtered;
    saveDB(db);
    res.json({ success: true });
  });

  // Authentication
  app.post('/api/auth/register', (req, res) => {
    const db = loadDB();
    const { email, password, firstName, lastName } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    const existing = db.users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
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
      avatarUrl: '/assets/profile-photo.jpeg'
    };

    db.users.push(newUser);
    saveDB(db);
    res.status(201).json(newUser);
  });

  app.post('/api/auth/login', (req, res) => {
    const db = loadDB();
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    // Default preview credentials bypass or lookup
    const user = db.users.find((u: UserProfile) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      // Auto-create for simplicity of demonstration & high fidelity login flow
      const fallbackUser: UserProfile = {
        uid: 'user-' + Date.now(),
        email,
        firstName: email.split('@')[0],
        lastName: '',
        followersCount: 0,
        worksCount: 0,
        salesCount: 0,
        bio: 'Art Collector & Admirer.',
        ownedArtIds: [],
        favoriteArtIds: [],
        isVerified: false,
        avatarUrl: '/assets/profile-photo.jpeg'
      };
      db.users.push(fallbackUser);
      saveDB(db);
      return res.json(fallbackUser);
    }
    res.json(user);
  });

  // Get current profile
  app.get('/api/auth/me', (req, res) => {
    const db = loadDB();
    const emailHeader = req.headers.authorization?.replace('Bearer ', '') || 'avantika@curated.art';
    const user = db.users.find((u: UserProfile) => u.email.toLowerCase() === emailHeader.toLowerCase()) || db.users[0];
    res.json(user);
  });

  // Update profile favorites / owned lists
  app.post('/api/auth/profile/action', (req, res) => {
    const db = loadDB();
    const emailHeader = req.headers.authorization?.replace('Bearer ', '') || 'avantika@curated.art';
    const userIndex = db.users.findIndex((u: UserProfile) => u.email.toLowerCase() === emailHeader.toLowerCase());
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { action, artworkId } = req.body; // action: 'favorite' | 'unfavorite' | 'own'
    const user = db.users[userIndex];

    if (action === 'favorite') {
      if (!user.favoriteArtIds.includes(artworkId)) {
        user.favoriteArtIds.push(artworkId);
      }
    } else if (action === 'unfavorite') {
      user.favoriteArtIds = user.favoriteArtIds.filter((id: string) => id !== artworkId);
    } else if (action === 'own') {
      if (!user.ownedArtIds.includes(artworkId)) {
        user.ownedArtIds.push(artworkId);
      }
    }

    db.users[userIndex] = user;
    saveDB(db);
    res.json(user);
  });

  // Orders Management
  app.get('/api/orders', (req, res) => {
    const db = loadDB();
    res.json(db.orders);
  });

  app.post('/api/orders', (req, res) => {
    const db = loadDB();
    const { name, email, walletAddress, paymentMethod, items, subtotal, processingFee, total } = req.body;

    const newOrder: Order = {
      id: 'CR-' + Math.floor(100000 + Math.random() * 900000),
      transactionHash: '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join(''),
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

    // Also mark items as owned by this buyer if they are logged in
    const userIndex = db.users.findIndex((u: UserProfile) => u.email.toLowerCase() === email?.toLowerCase());
    if (userIndex !== -1) {
      newOrder.items.forEach((item: any) => {
        if (!db.users[userIndex].ownedArtIds.includes(item.artworkId)) {
          db.users[userIndex].ownedArtIds.push(item.artworkId);
        }
      });
    }

    // Mark ordered artworks as sold/unavailable
    newOrder.items.forEach((item: any) => {
      const artIdx = db.artworks.findIndex((a: Artwork) => a.id === item.artworkId);
      if (artIdx !== -1) {
        db.artworks[artIdx].isAvailable = false;
      }
    });

    saveDB(db);
    res.status(201).json(newOrder);
  });

  app.put('/api/orders/:id/status', (req, res) => {
    const db = loadDB();
    const index = db.orders.findIndex((o: Order) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    db.orders[index].status = req.body.status || 'confirmed';
    saveDB(db);
    res.json(db.orders[index]);
  });

  // AI Recommendations using Server-Side Gemini API
  app.post('/api/recommendations', async (req, res) => {
    const client = getGeminiClient();
    const db = loadDB();
    const { userBio, favoriteCategories, cartItems, ownedArtTitles } = req.body;

    const artworksContext = db.artworks.map((a: Artwork) => ({
      id: a.id,
      title: a.title,
      artist: a.artist,
      category: a.category,
      price: `${a.priceUnit}${a.price}`,
      description: a.description
    }));

    if (!client) {
      // Highly intelligent heuristic fallback when GEMINI_API_KEY is not configured or in sandbox
      console.log('Gemini API key missing. Serving heuristic expert recommendations.');
      const categories = favoriteCategories || ['digital', 'sculpture'];
      const filteredRecommendations = db.artworks.filter((a: Artwork) => 
        categories.includes(a.category) && !ownedArtTitles?.includes(a.title)
      ).slice(0, 3);

      return res.json({
        curatorSpeech: "I have curated these works especially for you. Based on your love for deep architectural lines and generative mediums, these selections balance physical presence with digital weightlessness. They fit perfectly into the contemporary ethos you appreciate.",
        recommendedArtworkIds: filteredRecommendations.map((a: Artwork) => a.id)
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
              curatorSpeech: { type: Type.STRING, description: "Poetic explanation for the recommendations" },
              recommendedArtworkIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of recommended artwork IDs from the catalog"
              }
            },
            required: ["curatorSpeech", "recommendedArtworkIds"]
          }
        }
      });

      const resultText = response.text ? response.text.trim() : '{}';
      const parsed = JSON.parse(resultText);
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Recommendation Error:', err);
      // Fallback
      res.json({
        curatorSpeech: "An exquisite curation focusing on structural minimalism and organic digital fluids. Recommended for your exquisite taste.",
        recommendedArtworkIds: ['art-1', 'art-6', 'art-10']
      });
    }
  });


  // Vite Middleware Setup for seamless SPA fallback and assets serving
  if (process.env.NODE_ENV !== 'production') {
    const { default: react } = await import('@vitejs/plugin-react');
    const { default: tailwindcss } = await import('@tailwindcss/vite');

    const vite = await createViteServer({
      // Keep the config inline to avoid tsx + Windows URL scheme resolution issues.
      configFile: false,
      plugins: [react(), tailwindcss()],
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CURATED Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
