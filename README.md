# Course Portal Frontend

A modern, responsive React application for a course portal with referral system, built with Material-UI and Redux Toolkit.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login/registration with JWT tokens
- **Course Management**: Browse, view, and enroll in courses
- **Payment Integration**: Stripe payment processing with multiple payment methods
- **Referral System**: Complete referral tracking and commission management
- **Role-Based Access**: Different dashboards for users, agents, and admins

### User Roles
- **Regular Users**: Browse courses, make payments, access enrolled courses
- **Referral Agents**: Track referrals, manage commissions, request payouts
- **Admins**: Full system management, user approval, payment processing

### Technical Features
- **Responsive Design**: Mobile-first approach with Material-UI
- **State Management**: Redux Toolkit for global state management
- **Form Validation**: Yup schema validation for all forms
- **Real-time Updates**: Live data updates across components
- **Security**: Protected routes and secure API communication

## 🛠 Tech Stack

- **React 19** - Modern React with hooks
- **Material-UI 7** - Component library and theming
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Yup** - Form validation
- **Axios** - HTTP client
- **Stripe** - Payment processing
- **Vite** - Build tool and dev server

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd course-portal-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```
src/
├── components/           # React components
│   ├── Auth/           # Authentication components
│   ├── Dashboard/      # User dashboard
│   ├── AgentDashboard/ # Referral agent dashboard
│   ├── AdminDashboard/ # Admin dashboard
│   ├── Courses/        # Course-related components
│   ├── Payment/        # Payment components
│   ├── Layout/         # Layout components
│   └── ProtectedRoute/ # Route protection
├── store/              # Redux store
│   ├── store.js        # Store configuration
│   └── slices/         # Redux slices
│       ├── authSlice.js
│       ├── courseSlice.js
│       ├── paymentSlice.js
│       ├── referralSlice.js
│       └── adminSlice.js
└── main.jsx           # Application entry point
```

## 🔧 Configuration

### API Configuration
The application connects to the backend API. Update the API URL in the store slices if needed:

```javascript
const API_URL = 'http://localhost:5000/api';
```

### Stripe Configuration
For payment processing, configure your Stripe publishable key:

```javascript
const stripePromise = loadStripe('pk_test_your_publishable_key');
```

## 🎨 Customization

### Theme Customization
The Material-UI theme can be customized in `src/main.jsx`:

```javascript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  // Add more theme customizations
});
```

### Component Styling
Components use Material-UI's `sx` prop for styling. You can customize styles by modifying the `sx` props in each component.

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Role-based access control
- **Form Validation**: Client-side validation with Yup
- **Secure API Calls**: Axios interceptors for authentication
- **Input Sanitization**: XSS protection

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Linting
```bash
npm run lint
```

## 📊 Performance

- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image loading
- **Caching**: Redux state persistence
- **Bundle Optimization**: Tree shaking and minification

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

### Code Style
The project uses ESLint with React and Material-UI specific rules. Configure your editor to use the project's ESLint configuration.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

Keep the application updated by regularly running:
```bash
npm update
npm audit fix
```

## 📈 Monitoring

The application includes:
- Error boundary for React errors
- Console logging for debugging
- Performance monitoring capabilities
- User analytics tracking

---

**Note**: Make sure the backend API is running and properly configured before starting the frontend application.
