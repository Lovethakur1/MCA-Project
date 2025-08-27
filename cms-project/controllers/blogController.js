const BlogPost = require('../models/BlogPost');
const Content = require('../models/Content');

exports.getBlogPage = async (req, res) => {
  try {
    // Get published blog posts
    const blogPosts = await BlogPost.find({ published: true })
      .sort({ publishedAt: -1 })
      .lean();

    // Get featured post (most recent)
    const featuredPost = blogPosts[0] || null;

    // Get recent posts for tabs (excluding featured)
    const recentPosts = blogPosts.slice(1, 5);

    // Get blog page content
    const blogContent = await Content.find({ page: 'blog' }).lean();
    const contentData = {};
    blogContent.forEach(item => {
      if (!contentData[item.section]) {
        contentData[item.section] = {};
      }
      contentData[item.section][item.key] = item.value;
    });

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('blog', {
      title: 'Blog',
      featuredPost,
      recentPosts,
      blogPosts,
      blogSettings: contentData.settings || {},
      staticContent: contentData.static || {},
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading blog page:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog page' 
    });
  }
};

exports.getBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug, 
      published: true 
    }).lean();

    if (!post) {
      return res.status(404).render('404', { title: 'Post Not Found' });
    }

    // Get global content
    const navbarContent = await Content.find({ page: 'global', section: 'navbar' }).lean();
    const footerContent = await Content.find({ page: 'global', section: 'footer' }).lean();
    const siteSettings = await Content.find({ page: 'global', section: 'site' }).lean();

    const navbar = {};
    navbarContent.forEach(item => {
      navbar[item.key] = item.value;
    });

    const footer = {};
    footerContent.forEach(item => {
      footer[item.key] = item.value;
    });

    const site = {};
    siteSettings.forEach(item => {
      site[item.key] = item.value;
    });

    res.render('blog-post', {
      title: post.title,
      post,
      navbar,
      footer,
      siteSettings: site
    });
  } catch (error) {
    console.error('Error loading blog post:', error);
    res.status(500).render('error', { 
      title: 'Error',
      error: 'Failed to load blog post' 
    });
  }
};
