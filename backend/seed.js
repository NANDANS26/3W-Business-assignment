const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Post = require('./models/Post');
require('dotenv').config();

// Sample users
const sampleUsers = [
  { username: 'sarah_smith', email: 'sarah@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { username: 'john_doe', email: 'john@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john' },
  { username: 'emma_wilson', email: 'emma@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' },
  { username: 'mike_brown', email: 'mike@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
  { username: 'lisa_davis', email: 'lisa@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa' },
  { username: 'alex_johnson', email: 'alex@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
  { username: 'jessica_lee', email: 'jessica@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jessica' },
  { username: 'david_miller', email: 'david@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' },
  { username: 'sophia_garcia', email: 'sophia@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophia' },
  { username: 'ryan_taylor', email: 'ryan@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ryan' },
  { username: 'Mohd Arshad', email: 'arshad@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arshad' },
  { username: 'Subham Das', email: 'subham@example.com', password: 'password123', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=subham' },
];

// Regular posts
const samplePosts = [
  {
    text: '🏆 LEADERBOARD ACHIEVEMENT 🏆\n🎯 I secured rank 1 in TaskPlanet Leaderboard!\n\n💪 Play now and join the competition!\n#TaskPlanet #Leaderboard #Winning',
    image: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600',
    category: 'post',
    tags: ['TaskPlanet', 'Leaderboard', 'Winning']
  },
  {
    text: 'Happy Easter to all the Christians here! 🐰🥚\nWishing everyone a blessed and joyful Easter Sunday!',
    image: '',
    category: 'post',
    tags: ['Easter', 'Blessings']
  },
  {
    text: 'Beautiful sunset today! Nature never fails to amaze me 🌅\n#Nature #Sunset #Photography',
    image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600',
    category: 'post',
    tags: ['Nature', 'Sunset', 'Photography']
  },
  {
    text: 'Just finished a great workout! 💪 Feeling energized and ready to conquer the day!\n\nWho else is hitting the gym today?\n#Fitness #Workout #Healthy',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    category: 'post',
    tags: ['Fitness', 'Workout', 'Healthy']
  },
  {
    text: 'New recipe alert! 🍝 Made this amazing pasta dish today. The secret ingredient? Lots of love ❤️\n\nDM me for the recipe!\n#Foodie #Cooking #Pasta',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600',
    category: 'post',
    tags: ['Foodie', 'Cooking', 'Pasta']
  },
  {
    text: 'Remote work vibes ☕💻\nCoffee in hand, laptop open, ready to create magic!\n\nWhat\'s your work setup like?\n#RemoteWork #Productivity #DigitalNomad',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600',
    category: 'post',
    tags: ['RemoteWork', 'Productivity', 'DigitalNomad']
  },
  {
    text: '🎨 Art is not what you see, but what you make others see. - Edgar Degas\n\nVisited the art gallery today and was blown away by the creativity!\n#Art #Gallery #Inspiration',
    image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=600',
    category: 'post',
    tags: ['Art', 'Gallery', 'Inspiration']
  },
  {
    text: 'Weekend getaway to the mountains! 🏔️\n\nNothing beats fresh air and stunning views. Sometimes you just need to disconnect to reconnect.\n#Travel #Mountains #Weekend',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    category: 'post',
    tags: ['Travel', 'Mountains', 'Weekend']
  },
  {
    text: 'Coding late into the night... ☕💻\n\nThat feeling when your code finally works! 🎉\n\nDevelopers, you know the struggle!\n#Coding #Programming #DeveloperLife',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    category: 'post',
    tags: ['Coding', 'Programming', 'DeveloperLife']
  },
  {
    text: 'Puppy love! 🐶❤️\n\nMeet my new best friend, Max! He\'s already stolen my heart.\n\nPet parents, drop your fur baby pics below!\n#Dog #Puppy #PetLove',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600',
    category: 'post',
    tags: ['Dog', 'Puppy', 'PetLove']
  },
];

// Promotion posts
const samplePromotions = [
  {
    appName: 'Cash 11 - Play & Earn Money',
    promotionTitle: 'Refer And Earn',
    promotionDescription: 'Simple Task\nRefer And Earn',
    buttonText: 'Download Now',
    buttonLink: '#',
    promoCategory: 'refer-earn',
    category: 'promotion',
    image: ''
  },
  {
    appName: 'Earn Jet - Play More Earn Faster',
    promotionTitle: 'Refer And Earn',
    promotionDescription: 'Simple Tasks\nRefer And Earn',
    buttonText: 'Download Now',
    buttonLink: '#',
    promoCategory: 'refer-earn',
    category: 'promotion',
    image: ''
  },
  {
    appName: 'MoneyWay',
    promotionTitle: 'New app Launch today 9 am',
    promotionDescription: 'Launch today 9 am\nRefer And Earn',
    buttonText: 'Download Now',
    buttonLink: '#',
    promoCategory: 'refer-earn',
    category: 'promotion',
    image: ''
  },
  {
    appName: 'TaskPlanet',
    promotionTitle: 'Complete Tasks Earn Rewards',
    promotionDescription: 'Simple micro tasks\nDaily rewards guaranteed',
    buttonText: 'Join Now',
    buttonLink: '#',
    promoCategory: 'refer-earn',
    category: 'promotion',
    image: ''
  },
  {
    appName: 'CryptoMiner Pro',
    promotionTitle: 'Mine Crypto While You Sleep',
    promotionDescription: 'Passive income opportunity\nStart with $0 investment',
    buttonText: 'Start Mining',
    buttonLink: '#',
    promoCategory: 'crypto',
    category: 'promotion',
    image: ''
  },
  {
    appName: 'Survey Rewards',
    promotionTitle: 'Earn Cash for Your Opinions',
    promotionDescription: 'Complete surveys\nGet paid instantly',
    buttonText: 'Sign Up Free',
    buttonLink: '#',
    promoCategory: 'refer-earn',
    category: 'promotion',
    image: ''
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/socialapp');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create regular posts
    const now = new Date();
    for (let i = 0; i < samplePosts.length; i++) {
      const postData = samplePosts[i];
      const user = createdUsers[i % createdUsers.length];
      
      const numLikes = Math.floor(Math.random() * createdUsers.length);
      const likes = [];
      const likedBy = [];
      
      for (let j = 0; j < numLikes; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (!likes.includes(randomUser._id)) {
          likes.push(randomUser._id);
          likedBy.push({ userId: randomUser._id, username: randomUser.username });
        }
      }

      const numComments = Math.floor(Math.random() * 5);
      const comments = [];
      
      const commentTexts = [
        'Amazing post! 🔥',
        'Love this! ❤️',
        'So inspiring! ✨',
        'Great content! 👏',
        'This is awesome! 🙌',
        'Thanks for sharing! 💯',
        'Beautiful! 😍',
        'Well said! 👍'
      ];

      for (let j = 0; j < numComments; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        const randomComment = commentTexts[Math.floor(Math.random() * commentTexts.length)];
        
        comments.push({
          userId: randomUser._id,
          username: randomUser.username,
          userAvatar: randomUser.avatar,
          text: randomComment,
          createdAt: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }

      const numShares = Math.floor(Math.random() * 3);
      const shares = [];
      const sharedBy = [];
      
      for (let j = 0; j < numShares; j++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (!shares.includes(randomUser._id)) {
          shares.push(randomUser._id);
          sharedBy.push({ userId: randomUser._id, username: randomUser.username });
        }
      }

      const post = new Post({
        ...postData,
        userId: user._id,
        username: user.username,
        userAvatar: user.avatar,
        likes,
        likedBy,
        comments,
        shares,
        sharedBy,
        savedBy: [],
        createdAt: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });

      await post.save();
      console.log(`Created post ${i + 1}: ${post.text.substring(0, 30)}...`);
    }

    // Create promotion posts
    const promotionUsers = [createdUsers[10], createdUsers[11], createdUsers[0]]; // Arshad, Subham, Sarah
    
    for (let i = 0; i < samplePromotions.length; i++) {
      const promoData = samplePromotions[i];
      const user = promotionUsers[i % promotionUsers.length];
      
      const post = new Post({
        ...promoData,
        userId: user._id,
        username: user.username,
        userAvatar: user.avatar,
        text: `${promoData.promotionTitle}\n${promoData.promotionDescription}\n${promoData.buttonText}: ${promoData.buttonLink}`,
        likes: [],
        likedBy: [],
        comments: [],
        shares: [],
        sharedBy: [],
        savedBy: [],
        createdAt: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000)
      });

      await post.save();
      console.log(`Created promotion ${i + 1}: ${promoData.appName}`);
    }

    // Add some follows
    for (const user of createdUsers) {
      const numFollows = Math.floor(Math.random() * 5);
      for (let i = 0; i < numFollows; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        if (randomUser._id.toString() !== user._id.toString() && !user.following.includes(randomUser._id)) {
          user.following.push(randomUser._id);
          user.followingCount++;
          randomUser.followers.push(user._id);
          randomUser.followersCount++;
          await randomUser.save();
        }
      }
      await user.save();
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`Created ${createdUsers.length} users`);
    console.log(`Created ${samplePosts.length} regular posts`);
    console.log(`Created ${samplePromotions.length} promotions`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
