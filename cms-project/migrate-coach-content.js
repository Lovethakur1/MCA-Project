const mongoose = require('mongoose');
const Content = require('./models/Content');

// Static content data from the Coach Mary Carmen page
const coachStaticContent = [
  // Hero Section
  {
    page: 'coach',
    section: 'hero',
    key: 'backgroundVideo',
    value: 'homebackground.mp4',
    type: 'video'
  },
  {
    page: 'coach',
    section: 'hero',
    key: 'title',
    value: '#MakeTheMost',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'hero',
    key: 'subtitle',
    value: 'Personal Trainer in Basel',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'hero',
    key: 'description',
    value: 'With me as your personal trainer, you will achieve a strong body and a happy mind.',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'hero',
    key: 'buttonText',
    value: 'Arrange Initial Consultation',
    type: 'text'
  },

  // Coach Intro Section
  {
    page: 'coach',
    section: 'intro',
    key: 'mainTitle',
    value: 'Hello, I\'m Your New Fitness Trainer!',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'intro',
    key: 'mainImage',
    value: 'coachmarycarmen.jpg',
    type: 'image'
  },
  {
    page: 'coach',
    section: 'intro',
    key: 'mainDescription',
    value: 'I Am Mary, Born In Basel In 1997 And Have Been Passionate About Sport Since I Was A Child. At The Age Of Five, I Discovered The Children\'s Circus And Began To Explore My Body Intensively. These Early Experiences In Floor Acrobatics, Juggling And Partner Aerial Acrobatics Laid The Foundation For My Sporting Development. Sport Is Not Only A Passion For Me, But Also Coaching. I Love Working With People As A Fitness Trainer, Getting To Know Them On A Personal Level And Finding Out What They Really Need. My Goal Is To Inspire You And Show You That You Can Achieve Anything With The Right Attitude.',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'intro',
    key: 'secondaryTitle',
    value: 'From The Depths To The Power - The Moving Story Of Fitness Trainer Mary Carmen.',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'intro',
    key: 'secondaryImage',
    value: 'coach2.jpg',
    type: 'image'
  },
  {
    page: 'coach',
    section: 'intro',
    key: 'secondaryDescription',
    value: 'My Path Has Not Always Been Easy. In My Youth, I Struggled With Depression And Eating Disorders, But Found My Way Back To Myself With Professional Help. Today I Live A Healthy And Conscious Life. Since 2018 I Have Been Dedicated To Functional Fitness Training. In 2021 I Founded My Own Personal Training And Health Promotion Company. Since 2024, I Have Been A Member Of The Swiss Personal Training Association And A Swica-Recognised Senior Personal Trainer. In Addition, Our Studio Is QualiTop Certified And Therefore Has 20 Health Insurance Companies That Will Reimburse You For Part Of The Costs Of Your Fitness Training And Personal Training. My Goal Is To Help People Of All Ages Achieve Their Goals, Whether It\'s A Change In Your Body Or An Improvement In Your Everyday Life. The First Step Is Crucial: Dare To Try Something New! Together We Will Create A Solid Foundation For Your Well-Being. If You Are Ready To Make A Change, Don\'t Hesitate To Contact Me!',
    type: 'text'
  },

  // Wave Video Section
  {
    page: 'coach',
    section: 'wave',
    key: 'backgroundVideo',
    value: '6936065_Water_Bubble_1920x1080.mp4',
    type: 'video'
  },
  {
    page: 'coach',
    section: 'wave',
    key: 'title',
    value: 'We are more than just a gym',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'wave',
    key: 'description',
    value: 'Ultimate Performance has radically redefined the art and science of one-to-one training to create an experience that will transform your body, your health and your life. We are not just personal trainers. We are more than just a gym. We have invested in building an ecosystem of world-class trainers, cutting-edge data and systems of accountability that give you a cast-iron blueprint for success that will work if you commit to the process. Whether you work together with us one-to-one in the gym, virtually, or online, our ethos is the same — excellence in everything we do, honesty and integrity as your trusted partner, and an approach tailored to your unique goals that delivers you maximum results in minimum time.',
    type: 'text'
  },

  // FAQ Section
  {
    page: 'coach',
    section: 'faq',
    key: 'title',
    value: 'Frequently Asked Questions',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'faq',
    key: 'subtitle',
    value: 'Get answers to common questions about personal training',
    type: 'text'
  },

  // Blog Section
  {
    page: 'coach',
    section: 'blog',
    key: 'subtitle',
    value: 'BLOG',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'blog',
    key: 'title',
    value: 'YOUR GO-TO BLOG',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'blog',
    key: 'description',
    value: 'Your weekly source for lifestyle and nutrition tips, exclusive insights and everything about current topics in personal training.',
    type: 'text'
  },
  {
    page: 'coach',
    section: 'blog',
    key: 'buttonText',
    value: 'To the blog',
    type: 'text'
  }
];

async function migrateCoachContent() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/cms_project');
    console.log('Connected to MongoDB');

    // Clear existing coach content
    await Content.deleteMany({ page: 'coach' });
    console.log('Cleared existing coach content');

    // Insert static content
    for (const contentItem of coachStaticContent) {
      try {
        await Content.findOneAndUpdate(
          { 
            page: contentItem.page, 
            section: contentItem.section, 
            key: contentItem.key 
          },
          contentItem,
          { upsert: true, new: true }
        );
        console.log(`✓ Migrated: ${contentItem.section}.${contentItem.key}`);
      } catch (error) {
        console.error(`✗ Failed to migrate: ${contentItem.section}.${contentItem.key}`, error.message);
      }
    }

    console.log('\n🎉 Coach content migration completed successfully!');
    console.log(`📊 Total items migrated: ${coachStaticContent.length}`);
    
    // Display summary
    const coachContent = await Content.find({ page: 'coach' });
    console.log(`📈 Items in database: ${coachContent.length}`);
    
    console.log('\n📋 Content organized by sections:');
    const sections = {};
    coachContent.forEach(item => {
      if (!sections[item.section]) {
        sections[item.section] = [];
      }
      sections[item.section].push(item.key);
    });
    
    Object.keys(sections).forEach(section => {
      console.log(`  ${section}: ${sections[section].join(', ')}`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateCoachContent();
}

module.exports = migrateCoachContent;
