import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { PropertyProvider } from './context/PropertyContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PropertyDetails from './pages/PropertyDetails';
import UserProfile from './pages/UserProfile';
import UpdateProfile from './pages/UpdateProfile';
import Payment from './pages/Payment';
import BookingDetails from './pages/BookingDetails';
import Accommodation from './pages/Accommodation';
import MyAccommodations from './pages/MyAccommodations';
import EditAccommodation from './pages/EditAccommodation';
import SearchResults from './pages/SearchResults';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/property/:id" element={<PropertyDetails />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/update-profile" element={<UpdateProfile />} />
                <Route path="/payment" element={<Payment />} />
                <Route path="/booking/:id" element={<BookingDetails />} />
                <Route path="/accommodation" element={<Accommodation />} />
                <Route path="/accommodation/edit/:id" element={<EditAccommodation />} />
                <Route path="/my-accommodations" element={<MyAccommodations />} />
                <Route path="/search" element={<SearchResults />} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </Router>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;