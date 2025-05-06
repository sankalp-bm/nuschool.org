function app() {
    return {
        isLoggedIn: false,
        showLoginModal: false,
        showRegisterModal: false,
        loginForm: {
            email: '',
            password: ''
        },
        registerForm: {
            email: '',
            password: '',
            userType: 'child'
        },
        recommendations: {
            math: {
                exercises: []
            },
            language: {
                exercises: []
            },
            computer: {
                exercises: []
            },
            creative: {
                exercises: []
            }
        },
        currentUser: null,
        errorMessage: '',
        backendUrl: 'http://localhost:3000',

        async init() {
            // Check backend connection
            try {
                const response = await fetch(`${this.backendUrl}/api/health`);
                if (!response.ok) {
                    console.error('Backend server is not responding');
                    this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
                }
            } catch (error) {
                console.error('Backend connection error:', error);
                this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
            }

            // Check for existing session
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await fetch(`${this.backendUrl}/api/health`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        this.isLoggedIn = true;
                        await this.loadRecommendations();
                    }
                } catch (error) {
                    console.error('Session validation failed:', error);
                    this.logout();
                }
            }
        },

        async login() {
            try {
                this.errorMessage = '';
                const response = await fetch(`${this.backendUrl}/api/users/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.loginForm)
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    this.isLoggedIn = true;
                    this.showLoginModal = false;
                    this.currentUser = data.user;
                    await this.loadRecommendations();
                } else {
                    this.errorMessage = data.error || 'Login failed. Please check your credentials.';
                    console.error('Login failed:', data.error);
                }
            } catch (error) {
                console.error('Login error:', error);
                this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
            }
        },

        async register() {
            try {
                this.errorMessage = '';
                console.log('Attempting registration with:', {
                    email: this.registerForm.email,
                    userType: this.registerForm.userType
                });

                const response = await fetch(`${this.backendUrl}/api/users/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.registerForm)
                });

                const data = await response.json();
                console.log('Registration response:', data);

                if (response.ok) {
                    localStorage.setItem('token', data.token);
                    this.isLoggedIn = true;
                    this.showRegisterModal = false;
                    this.currentUser = data.user;
                    await this.loadRecommendations();
                } else {
                    this.errorMessage = data.error || 'Registration failed. Please try again.';
                    console.error('Registration failed:', data.error);
                }
            } catch (error) {
                console.error('Registration error:', error);
                this.errorMessage = 'Cannot connect to server. Please make sure the backend server is running.';
            }
        },

        logout() {
            localStorage.removeItem('token');
            this.isLoggedIn = false;
            this.currentUser = null;
            this.recommendations = {
                math: { exercises: [] },
                language: { exercises: [] },
                computer: { exercises: [] },
                creative: { exercises: [] }
            };
        },

        async loadRecommendations() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${this.backendUrl}/api/recommendations/${this.currentUser.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    this.recommendations = await response.json();
                }
            } catch (error) {
                console.error('Error loading recommendations:', error);
            }
        },

        async startExercise(exercise) {
            console.log('Starting exercise:', exercise);
            switch (exercise.type) {
                case 'addition':
                    this.startMathExercise(exercise);
                    break;
                case 'alphabet':
                    this.startLanguageExercise(exercise);
                    break;
                case 'drawing':
                    this.startCreativeExercise(exercise);
                    break;
                default:
                    console.log('Unknown exercise type:', exercise.type);
            }
        },

        startMathExercise(exercise) {
            console.log('Starting math exercise:', exercise);
        },

        startLanguageExercise(exercise) {
            console.log('Starting language exercise:', exercise);
        },

        startCreativeExercise(exercise) {
            console.log('Starting creative exercise:', exercise);
        }
    };
}