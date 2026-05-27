import { CheckCircleIcon, ClockIcon, MapPinIcon, StarIcon, PhotoIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface AttractionCardProps {
  id: number;
  name: string;
  description: string;
  images: string[];
  distance: string;
  travel_time: string;
  type: string;
  highlights: string[];
  best_time: string;
  category: string;
  onImageClick?: () => void;
  getCategoryColor?: (category: string) => string;
}

const AttractionCard: React.FC<AttractionCardProps> = ({
  id,
  name,
  description,
  images,
  distance,
  travel_time,
  type,
  highlights,
  best_time,
  category,
  onImageClick,
  getCategoryColor
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if description is long enough to need truncation
  const needsTruncation = description.length > 150;
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const defaultGetCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      beach: 'bg-blue-100 text-blue-800',
      fort: 'bg-red-100 text-red-800',
      temple: 'bg-yellow-100 text-yellow-800',
      market: 'bg-green-100 text-green-800',
      viewpoint: 'bg-purple-100 text-purple-800',
      museum: 'bg-indigo-100 text-indigo-800',
      park: 'bg-emerald-100 text-emerald-800',
      agriculture: 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const categoryColor = getCategoryColor ? getCategoryColor(category) : defaultGetCategoryColor(category);

  // Get images to display (up to 4 images)
  const displayImages = images.length > 0 ? images.slice(0, 4) : [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];
  const remainingImages = images.length > 4 ? images.length - 4 : 0;

  // Determine grid layout based on number of images
  const getImageGridClass = () => {
    if (displayImages.length === 1) return 'grid-cols-1';
    if (displayImages.length === 2) return 'grid-cols-2';
    if (displayImages.length === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Multiple Images Grid */}
      <div className="relative h-64 sm:h-72">
        <div className={`grid ${getImageGridClass()} gap-1 h-full`}>
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative overflow-hidden group cursor-pointer"
              onClick={onImageClick}
            >
              <img
                src={image}
                alt={`${name} - Image ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                }}
              />
              {index === 0 && (
                <>
                  <div className="absolute top-3 left-3 z-10">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColor} shadow-lg`}>
                      {type}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 z-10 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">4.5</span>
                  </div>
                </>
              )}
              {/* Show overlay with image count on last image if there are more */}
              {index === displayImages.length - 1 && remainingImages > 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="text-white text-center">
                    <PhotoIcon className="h-8 w-8 mx-auto mb-1" />
                    <span className="text-sm font-semibold">+{remainingImages} more</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{name}</h3>
          {/* Prominent Distance Badge */}
          <div className="ml-3 flex-shrink-0">
            <div className="bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white px-3 py-1.5 rounded-lg shadow-md">
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                <span className="text-sm font-bold whitespace-nowrap">{distance}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description with expandable functionality */}
        <div className="mb-4">
          <p className={`text-gray-600 text-sm ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {description}
          </p>
          {needsTruncation && (
            <button
              onClick={toggleExpanded}
              className="text-golden-500 hover:text-golden-600 text-sm font-medium hover:underline mt-1 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Details */}
        <div className="mb-4 bg-gray-50 rounded-lg p-3">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-700">
              <ClockIcon className="h-4 w-4 mr-2 text-golden-500" />
              <span className="font-medium">{travel_time} drive</span>
            </div>
            <div className="flex items-center text-sm text-gray-700">
              <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
              <span>Best time: <span className="font-medium">{best_time}</span></span>
            </div>
          </div>
        </div>

        {/* Highlights */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Highlights:</h4>
          <div className="flex flex-wrap gap-1">
            {highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-golden-50 text-golden-700 text-xs rounded-full border border-golden-200"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onImageClick}
          className="w-full bg-gradient-to-r from-dark-blue-800 to-golden-500 text-white py-2 px-4 rounded-lg hover:from-dark-blue-900 hover:to-golden-600 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
        >
          View Gallery
        </button>
      </div>
    </div>
  );
};

export default AttractionCard; 
