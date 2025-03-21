import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Animated 404 Text */}
      <h1 className="text-9xl md:text-[12rem] font-extrabold text-black drop-shadow-lg animate-bounce-slow">
        404
      </h1>

      {/* Message */}
      <div className="text-center mt-6">
        <h2 className="text-3xl md:text-5xl font-semibold text-black mb-4">
          Oops! Lost in Space?
        </h2>
        <p className="text-lg md:text-xl text-black/80 max-w-md mx-auto">
          It seems we've ventured off the map. The page you're looking for doesn't exist—or maybe it’s hiding in another galaxy!
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 bg-black/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-black/20 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-black/15 rounded-full animate-float"></div>
      </div>

      {/* Back to Home Button */}
      <Link to="/" className="mt-10">
        <button className="px-8 py-4 bg-white text-indigo-600 font-semibold text-lg rounded-full shadow-lg hover:bg-indigo-100 hover:scale-105 transition-all duration-300">
          Beam Me Back Home
        </button>
      </Link>

      {/* Optional Footer */}
      <p className="absolute bottom-4 text-black/60 text-sm">
        © {new Date().getFullYear()}. All rights reserved.
      </p>
    </div>
  );
};

export default NotFound
// Add this to your Route
