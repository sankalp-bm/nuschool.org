require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test user credentials
const TEST_USER = {
    username: '1234',
    password: '1234',
    userType: 'child'
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// User routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Register user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          userType,
        },
      },
    });

    if (error) {
      console.error('Registration error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          user_type: userType,
          created_at: new Date(),
        },
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(400).json({ error: 'Failed to create user profile' });
    }

    res.json({
      user: data.user,
      token: data.session?.access_token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during registration' });
  }
});

// Login endpoint
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for test user
    if (email === TEST_USER.username && password === TEST_USER.password) {
      return res.json({
        user: {
          id: 'test-user-123',
          email: TEST_USER.username,
          userType: TEST_USER.userType
        },
        token: 'test-token-123'
      });
    }

    // Rest of the existing login code...
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login error:', error);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      user: { ...data.user, ...userProfile },
      token: data.session.access_token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'An unexpected error occurred during login' });
  }
});

// Learning progress routes
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Skills assessment routes
app.post('/api/assessment', async (req, res) => {
  try {
    const { userId, answers } = req.body;
    // Store assessment results
    const { data, error } = await supabase
      .from('skill_assessments')
      .insert([
        {
          user_id: userId,
          answers,
          timestamp: new Date(),
        },
      ]);

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Learning recommendations
app.get('/api/recommendations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    // Get user's current skills and progress
    const { data: progress, error: progressError } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) throw progressError;

    // Generate personalized recommendations based on progress
    const recommendations = {
      math: generateMathRecommendations(progress),
      language: generateLanguageRecommendations(progress),
      computer: generateComputerRecommendations(progress),
      creative: generateCreativeRecommendations(progress),
    };

    res.json(recommendations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper functions for generating recommendations
function generateMathRecommendations(progress) {
  // Implement AI-based recommendation logic
  return {
    level: 'beginner',
    topics: ['addition', 'subtraction'],
    exercises: [
      {
        type: 'addition',
        difficulty: 'easy',
        content: 'Simple addition problems',
      },
    ],
  };
}

function generateLanguageRecommendations(progress) {
  return {
    level: 'beginner',
    topics: ['alphabets', 'basic words'],
    exercises: [
      {
        type: 'alphabet',
        difficulty: 'easy',
        content: 'Letter recognition',
      },
    ],
  };
}

function generateComputerRecommendations(progress) {
  return {
    level: 'beginner',
    topics: ['keyboard', 'mouse'],
    exercises: [
      {
        type: 'keyboard',
        difficulty: 'easy',
        content: 'Basic keyboard usage',
      },
    ],
  };
}

function generateCreativeRecommendations(progress) {
  return {
    level: 'beginner',
    topics: ['drawing', 'cooking'],
    exercises: [
      {
        type: 'drawing',
        difficulty: 'easy',
        content: 'Basic shapes drawing',
      },
    ],
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 