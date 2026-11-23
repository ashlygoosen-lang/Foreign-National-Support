import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../lib/api';
import { EASE, Reveal, SplitHeading, TiltCard } from '../motion';
import { Search, MapPin, GraduationCap, Phone, Mail } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Link } from 'react-router-dom';

interface School {
  id: string;
  name: string;
  location: string;
  grades: string;
  fees: string;
  contact: string;
  email: string;
  image: string;
}

export function FindSchool() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);
  useEffect(() => {
    api<School[]>('/schools')
      .then(setSchools)
      .catch(() => setSchools([]))
      .finally(() => setLoadingSchools(false));
  }, []);

  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || school.location === selectedLocation;
    return matchesSearch && matchesLocation;
  });

  const locations = ['all', ...Array.from(new Set(schools.map(s => s.location)))];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <SplitHeading as="h1" immediate text="Find a Private School" className="mb-4 font-display font-bold text-3xl md:text-5xl tracking-tight text-gray-900" />
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse our network of partner private schools across South Africa
          </p>
        </div>

        {/* Important Notice */}
        <Reveal className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg mb-8">
          <h3 className="text-blue-900 mb-2 font-semibold">2025 Enrollment Period</h3>
          <p className="text-blue-800">
            Enrollment for Grade 2-7 and 9-12: Confirm acceptance of placements between
            17 September - 30 September 2025
          </p>
        </Reveal>

        {/* Search and Filters */}
        <Reveal delay={0.05} className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block mb-2">
                Search Schools
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by school name or location..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label htmlFor="location" className="block mb-2">
                Location
              </label>
              <select
                id="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc === 'all' ? 'All Locations' : loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Reveal>

        {/* School List */}
        {loadingSchools && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2].map((i) => <div key={i} className="h-[30rem] bg-white rounded-xl animate-pulse" />)}
          </div>
        )}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
          {filteredSchools.map((school, i) => (
            <motion.div
              key={school.id}
              layout
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.55, ease: EASE, delay: Math.min(i * 0.06, 0.3) }}
            >
            <TiltCard max={5} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-gray-900/10 transition-shadow duration-500 h-full">
              <div className="overflow-hidden h-48">
                <ImageWithFallback
                  src={school.image}
                  alt={school.name}
                  className="w-full h-48 object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="mb-3 font-display font-semibold text-lg">{school.name}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="size-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{school.location}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <GraduationCap className="size-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{school.grades}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Phone className="size-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span>{school.contact}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Mail className="size-4 flex-shrink-0 mt-0.5 text-emerald-600" />
                    <span className="break-all">{school.email}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-emerald-800">{school.fees}</p>
                </div>

                <Link
                  to={`/school-enrollment?school=${school.id}`}
                  className="aa-btn w-full bg-emerald-600 text-white p-3 rounded-lg hover:bg-emerald-700 block text-center"
                >
                  Apply Now
                </Link>
              </div>
            </TiltCard>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>

        {!loadingSchools && filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No schools found matching your criteria.</p>
          </div>
        )}

        {/* Additional Information */}
        <Reveal className="mt-12 bg-white rounded-xl shadow-sm p-8">
          <h2 className="mb-4 font-display font-semibold text-xl">How School Registration Works</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="mb-3">For Members</h3>
              <ol className="space-y-2 text-gray-600">
                <li>1. Browse schools in your area</li>
                <li>2. Request information from schools</li>
                <li>3. Visit schools for assessments</li>
                <li>4. Submit applications during enrollment period</li>
                <li>5. Confirm placement when offered</li>
              </ol>
            </div>
            <div>
              <h3 className="mb-3">What We Provide</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Access to partner schools</li>
                <li>• Application support</li>
                <li>• Registration guidance</li>
                <li>• Placement assistance</li>
                <li>• Ongoing support</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}