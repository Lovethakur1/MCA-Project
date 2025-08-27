const mongoose = require('mongoose');
const BlogPost = require('./models/BlogPost');

// Sample blog posts for the coach page
const sampleBlogPosts = [
  {
    title: 'Top 5 Holiday Hacks',
    slug: 'top-5-holiday-hacks',
    description: 'At MTM Gym, we\'re sharing 5 simple holiday nutrition hacks - like prioritizing proteins, staying active after meals, and sipping herbal teas - to help you maintain balanced blood sugar and energy during the festive season.',
    content: `
      <h2>Stay Healthy During the Holidays</h2>
      <p>The holiday season can be challenging for maintaining your fitness and nutrition goals. Here are my top 5 hacks to help you stay on track:</p>
      
      <h3>1. Prioritize Protein</h3>
      <p>Start each meal with a good source of protein. This helps stabilize blood sugar and keeps you feeling full longer.</p>
      
      <h3>2. Stay Active After Meals</h3>
      <p>Take a 10-15 minute walk after eating to help with digestion and blood sugar regulation.</p>
      
      <h3>3. Sip Herbal Teas</h3>
      <p>Replace sugary drinks with herbal teas like chamomile, peppermint, or ginger to aid digestion.</p>
      
      <h3>4. Practice Mindful Eating</h3>
      <p>Slow down and savor your food. This helps prevent overeating and improves digestion.</p>
      
      <h3>5. Stay Hydrated</h3>
      <p>Drink plenty of water throughout the day. Sometimes we mistake thirst for hunger.</p>
      
      <p>Remember, the holidays are about balance. Enjoy yourself while making smart choices!</p>
    `,
    published: true,
    featuredImage: 'blog1.jpg'
  },
  {
    title: 'Energizing Breakfast Ideas',
    slug: 'energizing-breakfast-ideas',
    description: 'Start your day right with these high-protein breakfast recipes that are both delicious and easy to make. Fuel your workouts and your day ahead.',
    content: `
      <h2>Power Up Your Morning</h2>
      <p>Breakfast is the most important meal of the day, especially when you're training regularly. Here are some of my favorite energizing breakfast ideas:</p>
      
      <h3>Protein-Packed Pancakes</h3>
      <p>Blend oats, banana, eggs, and protein powder for fluffy, nutritious pancakes that will keep you satisfied for hours.</p>
      
      <h3>Greek Yogurt Power Bowl</h3>
      <p>Layer Greek yogurt with berries, nuts, and a drizzle of honey for a protein-rich breakfast that's ready in minutes.</p>
      
      <h3>Overnight Oats</h3>
      <p>Prepare these the night before with oats, chia seeds, almond milk, and your favorite toppings for a grab-and-go option.</p>
      
      <h3>Veggie Scramble</h3>
      <p>Sautéed vegetables with eggs or tofu provide a savory, nutrient-dense start to your day.</p>
      
      <p>The key is to include protein, healthy fats, and complex carbohydrates to maintain steady energy levels throughout the morning.</p>
    `,
    published: true,
    featuredImage: 'blog2.jpg'
  },
  {
    title: 'The Power of Healthy Fats',
    slug: 'the-power-of-healthy-fats',
    description: 'Not all fats are created equal. Learn about the benefits of incorporating healthy fats like avocado, nuts, and olive oil into your diet for better health.',
    content: `
      <h2>Understanding Healthy Fats</h2>
      <p>For too long, fats have been demonized in the fitness world. But the truth is, healthy fats are essential for optimal health and performance.</p>
      
      <h3>Why We Need Healthy Fats</h3>
      <ul>
        <li>Hormone production and regulation</li>
        <li>Nutrient absorption (vitamins A, D, E, K)</li>
        <li>Brain health and cognitive function</li>
        <li>Satiety and appetite control</li>
        <li>Inflammation reduction</li>
      </ul>
      
      <h3>Best Sources of Healthy Fats</h3>
      <p><strong>Avocados:</strong> Rich in monounsaturated fats and fiber</p>
      <p><strong>Nuts and Seeds:</strong> Provide omega-3 fatty acids and protein</p>
      <p><strong>Olive Oil:</strong> Extra virgin olive oil is perfect for cooking and salads</p>
      <p><strong>Fatty Fish:</strong> Salmon, mackerel, and sardines are excellent sources of omega-3s</p>
      
      <h3>How Much Fat Should You Eat?</h3>
      <p>Aim for healthy fats to make up about 20-35% of your daily calories. Focus on quality over quantity!</p>
    `,
    published: true,
    featuredImage: 'blog3.jpg'
  },
  {
    title: 'Why Stretching is Non-Negotiable',
    slug: 'why-stretching-is-non-negotiable',
    description: 'Discover the importance of a proper warm-up and cool-down. We share essential stretching techniques to improve flexibility and prevent injuries.',
    content: `
      <h2>The Foundation of Every Workout</h2>
      <p>Stretching isn't just something you do before and after workouts - it's a crucial component of overall fitness and health.</p>
      
      <h3>Benefits of Regular Stretching</h3>
      <ul>
        <li>Improved flexibility and range of motion</li>
        <li>Reduced risk of injury</li>
        <li>Better blood circulation</li>
        <li>Decreased muscle tension and stress</li>
        <li>Enhanced athletic performance</li>
        <li>Better posture</li>
      </ul>
      
      <h3>Dynamic vs. Static Stretching</h3>
      <p><strong>Dynamic Stretching:</strong> Moving stretches that prepare your body for activity. Perfect for warm-ups.</p>
      <p><strong>Static Stretching:</strong> Holding stretches for 15-30 seconds. Best for cool-downs and flexibility improvement.</p>
      
      <h3>Essential Stretches for Everyone</h3>
      <p>1. Hip flexor stretch</p>
      <p>2. Hamstring stretch</p>
      <p>3. Shoulder rolls and stretches</p>
      <p>4. Spinal twists</p>
      <p>5. Calf stretches</p>
      
      <p>Remember: consistency is key. Even 10 minutes of stretching daily can make a huge difference in how you feel and move!</p>
    `,
    published: true
  },
  {
    title: 'Building Mental Resilience Through Fitness',
    slug: 'building-mental-resilience-through-fitness',
    description: 'Discover how regular exercise goes beyond physical benefits to build mental strength, confidence, and resilience in all areas of life.',
    content: `
      <h2>The Mind-Body Connection</h2>
      <p>As someone who has overcome personal challenges, I can tell you that fitness is as much about mental strength as it is about physical strength.</p>
      
      <h3>How Exercise Builds Mental Resilience</h3>
      <p>When we challenge ourselves physically, we're also building mental toughness. Every rep, every set, every workout teaches us that we can push through discomfort and achieve our goals.</p>
      
      <h3>The Science Behind It</h3>
      <ul>
        <li>Exercise releases endorphins - natural mood boosters</li>
        <li>Regular activity reduces cortisol (stress hormone) levels</li>
        <li>Physical challenges build confidence and self-efficacy</li>
        <li>Structured workouts create routine and stability</li>
      </ul>
      
      <h3>My Personal Journey</h3>
      <p>Having struggled with depression and eating disorders in my youth, I know firsthand how transformative fitness can be. It wasn't just about changing my body - it was about reclaiming my mental health and building the resilience to face life's challenges.</p>
      
      <h3>Tips for Building Mental Resilience</h3>
      <p>1. Set small, achievable goals</p>
      <p>2. Celebrate progress, not just perfection</p>
      <p>3. Use exercise as meditation in motion</p>
      <p>4. Find activities you genuinely enjoy</p>
      <p>5. Remember that every workout is a victory</p>
      
      <p>Remember: Your journey is unique. Be patient with yourself and trust the process!</p>
    `,
    published: true
  },
  {
    title: 'Functional Fitness: Training for Real Life',
    slug: 'functional-fitness-training-for-real-life',
    description: 'Learn how functional fitness movements translate to better performance in daily activities and why they should be part of everyone\'s routine.',
    content: `
      <h2>What is Functional Fitness?</h2>
      <p>Functional fitness focuses on movements that train your muscles to work together and prepare them for daily tasks by simulating common movements you might do at home, work, or in sports.</p>
      
      <h3>Benefits of Functional Training</h3>
      <ul>
        <li>Improved balance and coordination</li>
        <li>Better posture and core stability</li>
        <li>Reduced risk of injury in daily activities</li>
        <li>Enhanced athletic performance</li>
        <li>Increased efficiency in movement patterns</li>
      </ul>
      
      <h3>Key Functional Movements</h3>
      <p><strong>Squats:</strong> Mimics sitting down and standing up</p>
      <p><strong>Deadlifts:</strong> Teaches proper lifting mechanics</p>
      <p><strong>Push-ups:</strong> Strengthens pushing movements</p>
      <p><strong>Rows:</strong> Counteracts poor posture from sitting</p>
      <p><strong>Lunges:</strong> Improves single-leg strength and balance</p>
      
      <h3>Getting Started</h3>
      <p>Start with bodyweight movements and focus on form over intensity. As you master the basics, you can add resistance and complexity.</p>
      
      <p>Since 2018, I've been dedicated to functional fitness training, and I've seen incredible transformations in my clients - not just in how they look, but in how they move and feel in their daily lives.</p>
    `,
    published: true
  }
];

async function migrateBlogPosts() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/cms_project');
    console.log('Connected to MongoDB');

    console.log('Creating sample blog posts for coach page...');

    // Insert blog posts
    for (const blogData of sampleBlogPosts) {
      try {
        // Check if blog post already exists
        const existingPost = await BlogPost.findOne({ title: blogData.title });
        
        if (!existingPost) {
          const newPost = new BlogPost(blogData);
          await newPost.save();
          console.log(`✓ Created blog post: ${blogData.title}`);
        } else {
          console.log(`- Blog post already exists: ${blogData.title}`);
        }
      } catch (error) {
        console.error(`✗ Failed to create blog post: ${blogData.title}`, error.message);
      }
    }

    console.log('\n🎉 Blog posts migration completed successfully!');
    
    // Display summary
    const totalBlogs = await BlogPost.countDocuments();
    const publishedBlogs = await BlogPost.countDocuments({ status: 'published' });
    const categories = await BlogPost.distinct('category');
    
    console.log(`📊 Total blog posts: ${totalBlogs}`);
    console.log(`📈 Published posts: ${publishedBlogs}`);
    console.log(`📋 Categories: ${categories.join(', ')}`);

  } catch (error) {
    console.error('Blog migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateBlogPosts();
}

module.exports = migrateBlogPosts;
