import React from 'react';
import { X } from 'lucide-react';

interface BioModalProps {
  user: {
    username: string;
    email: string;
    bio: string;
    avatar?: string;
  };
  onClose: () => void;
}

const BioModal: React.FC<BioModalProps> = ({ user, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
        role="presentation"
      />

      {/* Modal - Based on Figma "About" Design */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-[#f7f7f7] rounded-3xl max-w-6xl w-full my-8 animate-fade-in relative">
          {/* Close button - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close modal"
            >
              <X size={28} className="text-gray-600" />
            </button>
          </div>

          {/* Main Content */}
          <div className="p-6 sm:p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start bg-white rounded-2xl p-8 lg:p-12 shadow-2xl border border-gray-100">
              {/* Left Column - Text Content */}
              <div className="flex flex-col gap-8 max-w-xl">
                <h1 className="text-5xl lg:text-6xl font-bold text-black tracking-tight">
                  About
                </h1>

                <div>
                  <h2 className="text-xl lg:text-2xl font-semibold text-black mb-6">
                    Contact me
                  </h2>

                  <div className="space-y-8">
                    {/* First Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        First name
                      </label>
                      <input
                        type="text"
                        value={user.username.split(' ')[0] || user.username}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black break-all"
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Your message
                      </label>
                      <textarea
                        value={user.bio || ''}
                        placeholder="Enter your question or message"
                        readOnly
                        rows={6}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-black min-h-[12rem]"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-sm aspect-[4/5] rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default BioModal;
