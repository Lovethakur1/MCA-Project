const mongoose = require('mongoose');
const Content = require('./models/Content');

const bootcampSeedData = [
  // Hero Section
  {
    page: 'bootcamp',
    section: 'hero',
    key: 'title',
    value: 'A boot camp as a booster for your fitness',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'hero',
    key: 'description',
    value: 'Our Boot Camp In Basel Is The Ideal 10-week Challenge To Take Your Fitness To The Next Level. In Intensive Training Sessions, We Focus On Strength, Endurance And Flexibility – All In Small Groups Directly At The Theater Basel And With Your Personal Trainer Mary Carmen.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'hero',
    key: 'button_text',
    value: 'Arrange Initial Consultation',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'hero',
    key: 'image_small',
    value: 'Image-1.png',
    type: 'image'
  },
  {
    page: 'bootcamp',
    section: 'hero',
    key: 'image_large',
    value: 'Image-2.png',
    type: 'image'
  },

  // Basel Section
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'title',
    value: 'Bootcamp in Basel',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'subtitle',
    value: 'Discover the Benefits That Set Us Apart and Propel Your Fitness Journey Forward.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'button_text',
    value: 'Free Trial Today',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'image',
    value: 'baselbootcamp.jpg',
    type: 'image'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_1_title',
    value: '10 weeks of intensive workouts',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_1_description',
    value: 'Our certified trainers provide personalized guidance and expert advice to help you achieve your fitness goals.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_2_title',
    value: '1 hour of training per day',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_2_description',
    value: 'Work out with the latest and most advanced fitness equipment to maximize your results and enhance your experience.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_3_title',
    value: '5 workouts per week',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_3_description',
    value: 'Enjoy a variety of classes and programs tailored to all fitness levels.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_4_title',
    value: 'A total of 55 workouts',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'basel',
    key: 'benefit_4_description',
    value: 'Complete your fitness transformation with our comprehensive workout program.',
    type: 'text'
  },

  // Croatia Section
  {
    page: 'bootcamp',
    section: 'croatia',
    key: 'title',
    value: 'Bootcamp in Croatia',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'croatia',
    key: 'description',
    value: 'Take an unforgettable sports holiday with a variety of workouts and yoga on the beach – for your fitness and well-being!',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'croatia',
    key: 'button_text',
    value: 'Free Trial Today',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'croatia',
    key: 'image',
    value: 'croatiabootcamp.jpg',
    type: 'image'
  },

  // FAQ Section
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'question_1',
    value: 'I need consultation about the prices of StrongX\'s services?',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'answer_1',
    value: 'Our prices depend on your goals. Contact us for a personalized quote and free consultation.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'question_2',
    value: 'As a beginner, how can I find out which workout program is right for me?',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'answer_2',
    value: 'Our trainers offer an initial assessment to design a program tailored to your needs and experience level.',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'question_3',
    value: 'Is my membership card valid for use at all StrongX facilities?',
    type: 'text'
  },
  {
    page: 'bootcamp',
    section: 'faq',
    key: 'answer_3',
    value: 'Yes! StrongX memberships give you access to all our nationwide facilities.',
    type: 'text'
  }
];

async function seedBootcampData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mca-cms');
    console.log('Connected to MongoDB');

    // Remove existing bootcamp content
    await Content.deleteMany({ page: 'bootcamp' });
    console.log('Removed existing bootcamp content');

    // Insert new bootcamp content
    await Content.insertMany(bootcampSeedData);
    console.log('Bootcamp seed data inserted successfully');

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding bootcamp data:', error);
    mongoose.connection.close();
  }
}

seedBootcampData();
