import { db } from './src/lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

const mockUsers = [
  {
    id: 'usr_j1',
    username: 'Abebe Kebede',
    email: 'abebe@example.com',
    role: 'user',
    loyaltyPoints: 12500,
    avatar: 'https://i.pravatar.cc/150?u=abebe'
  },
  {
    id: 'usr_j2',
    username: 'Sara Mohammed',
    email: 'sara@example.com',
    role: 'user',
    loyaltyPoints: 9800,
    avatar: 'https://i.pravatar.cc/150?u=sara'
  },
  {
    id: 'usr_j3',
    username: 'Dawit Tekle',
    email: 'dawit@example.com',
    role: 'user',
    loyaltyPoints: 7200,
    avatar: 'https://i.pravatar.cc/150?u=dawit'
  },
  {
    id: 'usr_j4',
    username: 'Beti Solomon',
    email: 'beti@example.com',
    role: 'user',
    loyaltyPoints: 5400,
    avatar: 'https://i.pravatar.cc/150?u=beti'
  },
  {
    id: 'usr_j5',
    username: 'Hassen Ahmed',
    email: 'hassen@example.com',
    role: 'user',
    loyaltyPoints: 4200,
    avatar: 'https://i.pravatar.cc/150?u=hassen'
  }
];

async function seedLeaderboard() {
  console.log("Seeding leaderboard users...");
  for (const user of mockUsers) {
    await setDoc(doc(db, 'users', user.id), user);
  }
  console.log("Leaderboard seeding complete!");
}

seedLeaderboard().catch(console.error);
