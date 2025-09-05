# Fregie Admin - Food Scanner Management System

A comprehensive admin interface for managing the Fregie food scanner app's products and dietary preferences. Built with Next.js 15, TypeScript, Tailwind CSS, and Firebase Firestore.

## 🚀 Features

### Product Management
- **CRUD Operations**: Create, read, update, and delete food products
- **Rich Product Data**: Manage comprehensive product information including:
  - Product name, brand, and barcode
  - Ingredients list with easy add/remove functionality
  - Allergen warnings for safety
  - Nutritional information
  - Manufacturer details and origin
  - Product images via URL
- **Search & Filtering**: Find products by name, brand, or barcode
- **Brand Filtering**: Filter products by specific brands
- **Responsive Design**: Mobile-friendly interface

### Dietary Preferences Management
- **Dietary Restrictions**: Manage various dietary preferences and restrictions
- **Ingredient Tracking**: Track restricted ingredients for each preference type
- **Flexible Categories**: Support for diet types, allergies, and restrictions
- **Search & Filtering**: Find preferences by name or type ID
- **Type Filtering**: Filter by preference categories

### Technical Features
- **Real-time Data**: Firebase Firestore integration for live data updates
- **Type Safety**: Full TypeScript support with strict typing
- **Modern UI**: Clean, intuitive interface built with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Smooth loading indicators for better UX

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (ready for future implementation)
- **Language**: TypeScript
- **UI Components**: Headless UI + Heroicons

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── Navigation.tsx  # Main navigation
│   ├── ProductsPage.tsx # Products management
│   ├── PreferencesPage.tsx # Preferences management
│   ├── ProductCard.tsx # Product display card
│   ├── PreferenceCard.tsx # Preference display card
│   ├── ProductForm.tsx # Product add/edit form
│   ├── PreferenceForm.tsx # Preference add/edit form
│   ├── LoadingSpinner.tsx # Loading indicator
│   └── ErrorMessage.tsx # Error display
├── hooks/              # Custom React hooks
│   └── useFirestore.ts # Firebase data management
├── lib/                # Utility libraries
│   ├── firebase.ts     # Firebase configuration
│   ├── firestore.ts    # Firestore operations
│   └── utils.ts        # Helper functions
└── types/              # TypeScript type definitions
    └── index.ts        # Product and Preference interfaces
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fregie-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore Database
   - Get your Firebase configuration
   - Update `src/lib/firebase.ts` with your config

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Firebase Configuration

The app is pre-configured with Firebase. Update the configuration in `src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📱 Usage

### Managing Products

1. **Add New Product**
   - Click "Add Product" button
   - Fill in product details (name, brand, barcode are required)
   - Add ingredients and allergen warnings
   - Save the product

2. **Edit Product**
   - Click the edit icon on any product card
   - Modify the information as needed
   - Save changes

3. **Delete Product**
   - Click the delete icon on any product card
   - Confirm deletion

4. **Search & Filter**
   - Use the search bar to find products by name, brand, or barcode
   - Use the brand filter to show products from specific brands

### Managing Dietary Preferences

1. **Add New Preference**
   - Click "Add Preference" button
   - Enter preference name and type
   - Add restricted ingredients
   - Save the preference

2. **Edit Preference**
   - Click the edit icon on any preference card
   - Modify the information as needed
   - Save changes

3. **Delete Preference**
   - Click the delete icon on any preference card
   - Confirm deletion

4. **Search & Filter**
   - Use the search bar to find preferences by name or type ID
   - Use the type filter to show preferences of specific categories

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **New Data Types**: Add interfaces to `src/types/index.ts`
2. **New Components**: Create in `src/components/`
3. **New Hooks**: Add to `src/hooks/`
4. **New Services**: Extend `src/lib/firestore.ts`

### Code Style

- Use TypeScript for all new code
- Follow the existing component patterns
- Use Tailwind CSS for styling
- Implement proper error handling
- Add loading states for async operations

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables for Firebase
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Docker containers

## 🔒 Security Considerations

- Firebase Security Rules should be configured for production
- Implement user authentication for admin access
- Validate all input data
- Use environment variables for sensitive configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the Firebase documentation for database-related issues

## 🔮 Future Enhancements

- User authentication and role-based access
- Bulk import/export functionality
- Advanced analytics and reporting
- Real-time notifications
- Mobile app companion
- API endpoints for external integrations
- Advanced search with filters
- Image upload and management
- Audit logging
- Multi-language support
