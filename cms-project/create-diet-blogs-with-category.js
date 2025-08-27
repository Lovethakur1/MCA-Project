const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cms-project', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const BlogPost = require('./models/BlogPost');

const dietNutritionBlogs = [
  {
    title: "Top 10 Superfoods for Athletes",
    slug: "top-10-superfoods-for-athletes",
    excerpt: "Discover the most nutrient-dense foods that will fuel your workouts, speed recovery, and optimize your athletic performance naturally.",
    content: `# Top 10 Superfoods for Athletes

As an athlete or fitness enthusiast, what you eat directly impacts your performance, recovery, and overall health. Here are the top 10 superfoods that should be staples in every athlete's diet:

## 1. Quinoa
This complete protein contains all nine essential amino acids and provides sustained energy for long workouts.

## 2. Sweet Potatoes
Rich in complex carbohydrates and beta-carotene, perfect for pre-workout fuel.

## 3. Blueberries
Packed with antioxidants that help reduce inflammation and speed recovery.

## 4. Salmon
High in omega-3 fatty acids and protein for muscle repair and brain health.

## 5. Greek Yogurt
Excellent source of protein and probiotics for digestive health.

## 6. Spinach
Loaded with iron, folate, and nitrates for improved oxygen delivery.

## 7. Avocados
Healthy fats for hormone production and sustained energy.

## 8. Chia Seeds
Omega-3s, fiber, and protein in a tiny package.

## 9. Bananas
Natural sugars and potassium for quick energy and muscle function.

## 10. Lean Beef
High-quality protein and iron for muscle building and energy.

Incorporate these superfoods into your daily nutrition plan for optimal athletic performance!`,
    description: "A comprehensive guide to the most nutrient-dense foods that enhance athletic performance and recovery.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  },
  {
    title: "Pre-Workout Nutrition: What to Eat for Maximum Performance",
    slug: "pre-workout-nutrition-guide",
    excerpt: "Learn what to eat before your workout to maximize energy, endurance, and performance. Complete guide with timing and food suggestions.",
    content: `# Pre-Workout Nutrition: Fueling Your Success

The right pre-workout nutrition can make the difference between a good workout and a great one. Here's your complete guide to eating for performance:

## Timing is Everything

### 3-4 Hours Before
- Full meal with complex carbs, lean protein, and healthy fats
- Example: Grilled chicken with quinoa and vegetables

### 1-2 Hours Before
- Light meal focused on easily digestible carbs
- Example: Banana with almond butter

### 30 Minutes Before
- Simple carbohydrates for quick energy
- Example: Dates or a small sports drink

## Best Pre-Workout Foods

### For Energy:
- Oatmeal with berries
- Whole grain toast with honey
- Banana with peanut butter

### For Endurance:
- Sweet potato
- Greek yogurt with granola
- Apple slices with almond butter

### For Strength Training:
- Protein smoothie with banana
- Hard-boiled eggs with toast
- Cottage cheese with fruit

## What to Avoid
- High fiber foods (can cause digestive issues)
- High fat meals (slow digestion)
- Too much caffeine
- New foods (stick to what you know works)

## Hydration
Don't forget to drink 16-20 oz of water 2-3 hours before exercise, and another 8 oz 15-20 minutes before.

Remember, everyone is different. Experiment during training to find what works best for you!`,
    description: "Complete guide to pre-workout nutrition with timing strategies and food recommendations for optimal performance.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  },
  {
    title: "Healthy Fats for Weight Loss: The Ultimate Guide",
    slug: "healthy-fats-for-weight-loss",
    excerpt: "Not all fats are created equal. Discover which healthy fats can actually help you lose weight and improve your overall health.",
    content: `# Healthy Fats for Weight Loss: Breaking the Myths

For years, we've been told that fat makes you fat. Science now shows us that healthy fats are essential for weight loss and optimal health.

## Why Healthy Fats Help Weight Loss

### 1. Satiety
Fats help you feel full longer, reducing overall calorie intake.

### 2. Hormone Production
Essential for producing hormones that regulate metabolism and appetite.

### 3. Nutrient Absorption
Help absorb fat-soluble vitamins A, D, E, and K.

### 4. Steady Blood Sugar
Prevent spikes and crashes that lead to cravings.

## The Best Healthy Fats

### Monounsaturated Fats:
- Avocados
- Olive oil
- Nuts (almonds, cashews)
- Olives

### Polyunsaturated Fats (Omega-3s):
- Salmon and fatty fish
- Walnuts
- Chia seeds
- Flaxseeds

### Medium-Chain Triglycerides (MCTs):
- Coconut oil
- MCT oil
- Grass-fed butter

## How Much Fat Should You Eat?

Aim for 20-35% of your daily calories from healthy fats. For a 2000-calorie diet, that's about 44-78 grams of fat per day.

## Sample Day of Healthy Fats

**Breakfast:** Avocado toast with hemp seeds
**Lunch:** Salad with olive oil dressing and walnuts
**Snack:** Apple with almond butter
**Dinner:** Grilled salmon with vegetables

## Fats to Avoid
- Trans fats (processed foods)
- Excessive omega-6 oils (corn, soybean)
- Fried foods
- Processed meats

Remember: Quality matters more than quantity when it comes to fats!`,
    description: "Comprehensive guide to healthy fats that support weight loss and overall health, with practical tips and meal ideas.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  },
  {
    title: "Post-Workout Recovery Foods: Optimize Your Results",
    slug: "post-workout-recovery-foods",
    excerpt: "Optimize your recovery with these science-backed nutrition strategies. Learn what to eat after your workout for maximum results.",
    content: `# Post-Workout Recovery Foods: The Key to Progress

What you eat after your workout is just as important as the workout itself. Here's how to optimize your recovery nutrition:

## The Recovery Window

The first 30-60 minutes after exercise is crucial for:
- Replenishing glycogen stores
- Repairing muscle tissue
- Reducing inflammation
- Rehydrating the body

## The Perfect Post-Workout Ratio

Aim for a 3:1 or 4:1 ratio of carbohydrates to protein within 30 minutes of finishing your workout.

## Best Recovery Foods

### Quick Options (0-30 minutes):
- Chocolate milk
- Banana with protein powder
- Greek yogurt with berries
- Recovery smoothie

### Full Meals (30-60 minutes):
- Grilled chicken with sweet potato
- Salmon with quinoa and vegetables
- Turkey and avocado wrap
- Eggs with whole grain toast

## Specific Nutrients for Recovery

### Protein (20-25g):
- Rebuilds muscle tissue
- Sources: lean meats, dairy, protein powder

### Carbohydrates (30-60g):
- Replenishes energy stores
- Sources: fruits, whole grains, starchy vegetables

### Antioxidants:
- Reduce inflammation
- Sources: berries, cherries, leafy greens

### Electrolytes:
- Restore fluid balance
- Sources: coconut water, bananas, dairy

## Sample Recovery Meals

### Endurance Training:
Smoothie with banana, berries, protein powder, and coconut water

### Strength Training:
Grilled chicken breast with brown rice and steamed broccoli

### HIIT Workout:
Greek yogurt parfait with granola and mixed berries

## Hydration is Key

Drink 16-24 oz of fluid for every pound lost during exercise. Include electrolytes if you've sweated heavily.

## What Not to Eat

Avoid these post-workout:
- High-fat foods (slow digestion)
- Alcohol (impairs recovery)
- Processed junk food
- Excessive caffeine

Proper post-workout nutrition can improve your results by up to 25%. Don't let poor recovery nutrition sabotage your hard work!`,
    description: "Science-backed guide to post-workout nutrition for optimal recovery, muscle building, and performance enhancement.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  },
  {
    title: "Meal Prep for Busy Athletes: Time-Saving Strategies",
    slug: "meal-prep-for-busy-athletes",
    excerpt: "Master the art of meal preparation with these time-saving strategies and nutritious recipes perfect for your busy lifestyle.",
    content: `# Meal Prep for Busy Athletes: Efficiency Meets Nutrition

Juggling training, work, and life can make healthy eating challenging. Here's how to meal prep like a pro:

## Benefits of Meal Prep

- Saves time during busy weekdays
- Ensures consistent nutrition
- Reduces food waste
- Saves money
- Eliminates decision fatigue

## The Meal Prep Game Plan

### Sunday Prep Session (2-3 hours):
1. Plan your week's meals
2. Shop for ingredients
3. Prep proteins, carbs, and vegetables
4. Assemble meals in containers

### Mid-Week Top-Up (30 minutes):
- Wash and cut fresh vegetables
- Prepare additional proteins if needed

## Essential Meal Prep Equipment

- Glass containers (various sizes)
- Sheet pans
- Slow cooker or Instant Pot
- Good knife set
- Cutting boards
- Food scale

## Batch Cooking Strategies

### Proteins:
- Grill multiple chicken breasts
- Bake salmon fillets
- Cook ground turkey in bulk
- Hard boil a dozen eggs

### Carbohydrates:
- Cook large batches of quinoa
- Roast sweet potatoes
- Prepare brown rice
- Bake oatmeal cups

### Vegetables:
- Roast mixed vegetables
- Steam broccoli and green beans
- Pre-cut raw vegetables
- Make large salads (dressing separate)

## Sample Meal Prep Menu

### Breakfast Options:
- Overnight oats with protein powder
- Egg muffins with vegetables
- Greek yogurt parfaits
- Smoothie packs (freeze ingredients)

### Lunch/Dinner Combinations:
- Chicken, quinoa, and roasted vegetables
- Salmon, sweet potato, and asparagus
- Turkey meatballs with brown rice and zucchini
- Beef stir-fry with mixed vegetables

### Snacks:
- Cut vegetables with hummus
- Mixed nuts and dried fruit
- Protein balls
- Apple slices with nut butter

## Storage Tips

- Label containers with contents and date
- Store proteins for up to 4 days
- Keep cut vegetables in water
- Freeze extra portions for later weeks
- Store dressings and sauces separately

## Time-Saving Hacks

1. **Double recipes** and freeze half
2. **Use frozen vegetables** when fresh prep time is limited
3. **Invest in pre-cut vegetables** for busy weeks
4. **Cook once, eat twice** - repurpose leftovers
5. **Prep smoothie ingredients** in freezer bags

## Sample 3-Hour Prep Session

**Hour 1:** Prep and start proteins (chicken, salmon, hard-boiled eggs)
**Hour 2:** Prepare carbohydrates and start roasting vegetables
**Hour 3:** Assemble meals, portion snacks, and store everything

## Meal Prep Recipes

### Power Bowls:
Base + Protein + Vegetables + Healthy Fat + Sauce

### Sheet Pan Meals:
Protein + vegetables cooked together with herbs and spices

### Mason Jar Salads:
Dressing on bottom, sturdy vegetables, proteins, greens on top

Remember: Start small! Even prepping 2-3 meals can make a huge difference in your week.`,
    description: "Complete guide to efficient meal preparation for athletes, including strategies, recipes, and time-saving tips.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  },
  {
    title: "Hydration and Athletic Performance: The Complete Guide",
    slug: "hydration-and-athletic-performance",
    excerpt: "Understanding the critical role of proper hydration in athletic performance and how to optimize your fluid intake for maximum results.",
    content: `# Hydration and Athletic Performance: The Foundation of Success

Water is the most important nutrient for athletic performance, yet it's often overlooked. Here's everything you need to know about optimal hydration:

## Why Hydration Matters

### Performance Impact:
- Just 2% dehydration can reduce performance by 10-15%
- Affects strength, power, and endurance
- Impairs cognitive function and decision-making

### Physiological Functions:
- Temperature regulation through sweating
- Joint lubrication
- Nutrient transport
- Waste removal

## Daily Hydration Needs

### Base Requirements:
- Men: 3.7 liters (15.5 cups) daily
- Women: 2.7 liters (11.5 cups) daily
- Athletes: Add 12-16 oz per hour of training

### Factors Affecting Needs:
- Exercise intensity and duration
- Environmental temperature and humidity
- Individual sweat rate
- Body size and composition

## Pre-Exercise Hydration

### 2-3 Hours Before:
- Drink 17-20 oz of water or sports drink
- Check urine color (should be pale yellow)

### 15-20 Minutes Before:
- Drink 8 oz of fluid
- Avoid excessive amounts to prevent stomach discomfort

## During Exercise Hydration

### Duration Under 1 Hour:
- Water is usually sufficient
- 6-8 oz every 15-20 minutes

### Duration Over 1 Hour:
- Sports drink with electrolytes
- 6-12 oz every 15-20 minutes
- Target 30-60g carbohydrates per hour

## Post-Exercise Hydration

### Immediate (0-2 hours):
- Drink 150% of fluid lost through sweat
- Weigh yourself before and after exercise
- For every pound lost, drink 24 oz of fluid

### Electrolyte Replacement:
- Sodium: 200-700mg per hour
- Potassium: 150-300mg per hour

## Signs of Dehydration

### Mild (1-2% body weight loss):
- Thirst
- Dry mouth
- Fatigue

### Moderate (3-4% body weight loss):
- Decreased performance
- Headache
- Dark urine

### Severe (5%+ body weight loss):
- Dizziness
- Rapid heartbeat
- Medical emergency

## Hydration Strategies by Sport

### Endurance Sports:
- Start well-hydrated
- Regular small sips throughout
- Electrolyte replacement crucial

### Team Sports:
- Pre-hydrate before games
- Utilize timeouts and breaks
- Focus on rapid rehydration

### Strength Training:
- Sip water between sets
- Don't wait until thirsty
- Monitor urine color

## Best Hydration Sources

### Water:
- Best for exercise under 1 hour
- Zero calories
- Readily available

### Sports Drinks:
- Ideal for exercise over 1 hour
- Contains electrolytes and carbohydrates
- 6-8% carbohydrate concentration optimal

### Natural Options:
- Coconut water (natural electrolytes)
- Watermelon juice (natural sugars)
- Diluted fruit juices

## Common Hydration Mistakes

1. **Waiting until thirsty** - You're already dehydrated
2. **Over-hydrating** - Can lead to hyponatremia
3. **Ignoring electrolytes** - Water alone isn't enough for long exercise
4. **Not monitoring urine** - Best indicator of hydration status
5. **Relying on caffeine** - Can have diuretic effects

## Hydration Monitoring Tools

### Urine Color Chart:
- Pale yellow = well hydrated
- Dark yellow = dehydrated
- Clear = possibly over-hydrated

### Body Weight:
- Check before and after exercise
- 1 lb lost = 16 oz fluid needed

### Thirst:
- Late indicator of dehydration
- Don't rely on this alone

## Seasonal Considerations

### Hot Weather:
- Increase fluid intake 2-3 hours before
- Use cooling strategies (ice, cold towels)
- Monitor for heat illness signs

### Cold Weather:
- Don't ignore hydration needs
- Respiratory water loss increases
- Warm fluids can be beneficial

## Special Populations

### Masters Athletes:
- Decreased thirst sensation
- May need structured hydration plan
- Monitor more closely

### Youth Athletes:
- Higher surface area to body weight ratio
- Greater heat production
- Need frequent hydration breaks

Remember: Optimal hydration is individual. Experiment during training to find your perfect strategy!`,
    description: "Comprehensive guide to hydration strategies for athletes, including timing, quantities, and performance optimization tips.",
    category: "diet",
    status: "published",
    author: "Coach Mary Carmen",
    featuredImage: "",
    published: true
  }
];

async function createDietBlogsWithCategory() {
  try {
    console.log('Creating Diet & Nutrition blog posts with proper category field...');
    
    // Clear existing blog posts
    await BlogPost.deleteMany({});
    console.log('Cleared all existing blogs');
    
    // Create new blog posts with proper schema
    const createdBlogs = await BlogPost.insertMany(dietNutritionBlogs);
    console.log(`Successfully created ${createdBlogs.length} Diet & Nutrition blog posts!`);
    
    // Display created blogs with their categories
    console.log('\n=== CREATED BLOG POSTS ===');
    createdBlogs.forEach((blog, index) => {
      console.log(`${index + 1}. Title: ${blog.title}`);
      console.log(`   Category: ${blog.category}`);
      console.log(`   Status: ${blog.status}`);
      console.log(`   Published: ${blog.published}`);
      console.log(`   Author: ${blog.author}`);
      console.log(`   Slug: ${blog.slug}`);
      console.log('   ---');
    });
    
    // Verify the data
    const dietBlogs = await BlogPost.find({ category: 'diet', status: 'published' });
    console.log(`\n✅ Found ${dietBlogs.length} published Diet & Nutrition blogs in database`);
    
  } catch (error) {
    console.error('Error creating diet blogs:', error);
  } finally {
    mongoose.connection.close();
  }
}

createDietBlogsWithCategory();
