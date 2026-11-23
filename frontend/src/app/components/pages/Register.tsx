import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Heart, GraduationCap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useAuth } from '../../lib/auth';
import { EASE, Spinner } from '../motion';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [applicationType, setApplicationType] = useState<'school' | 'healthcare' | 'both'>('both');
  const [idType, setIdType] = useState<'id' | 'passport'>('passport');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phone: '',
    address: '',
    nationality: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match.');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters.');
    setSubmitting(true);
    try {
      const user = await register({ ...formData, idType, applicationType });
      toast.success(`Welcome, ${user.firstName}! Your member number is ${user.memberNumber}.`, {
        description: 'Next step: complete your biometric verification.',
      });
      navigate('/biometric-verification');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-emerald-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 ring-1 ring-gray-100 p-8">
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.2 }} className="bg-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
              <UserPlus className="size-8 text-white" />
            </motion.div>
            <h2 className="mb-2">Member Registration</h2>
            <p className="text-gray-600">Join our community platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Application Type */}
            <div>
              <label className="block mb-3">Applying for: *</label>
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setApplicationType('school')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    applicationType === 'school'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-300'
                  }`}
                >
                  <GraduationCap className={`size-8 mx-auto mb-2 ${
                    applicationType === 'school' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm">School Admission</p>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType('healthcare')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    applicationType === 'healthcare'
                      ? 'border-red-600 bg-red-50'
                      : 'border-gray-300 hover:border-red-300'
                  }`}
                >
                  <Heart className={`size-8 mx-auto mb-2 ${
                    applicationType === 'healthcare' ? 'text-red-600' : 'text-gray-400'
                  }`} />
                  <p className="text-sm">Healthcare Access</p>
                </button>
                <button
                  type="button"
                  onClick={() => setApplicationType('both')}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    applicationType === 'both'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex justify-center gap-2 mb-2">
                    <GraduationCap className={`size-6 ${
                      applicationType === 'both' ? 'text-emerald-600' : 'text-gray-400'
                    }`} />
                    <Heart className={`size-6 ${
                      applicationType === 'both' ? 'text-emerald-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-sm">Both Services</p>
                </button>
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* ID Type Selection */}
            <div>
              <label className="block mb-2">Identification Type *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIdType('id')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    idType === 'id'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  ID Number
                </button>
                <button
                  type="button"
                  onClick={() => setIdType('passport')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] ${
                    idType === 'passport'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:border-emerald-300'
                  }`}
                >
                  Passport / Permit Number
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="idNumber" className="block mb-2">
                {idType === 'id' ? 'ID Number' : 'Passport / Permit Number'} *
              </label>
              <input
                type="text"
                id="idNumber"
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder={idType === 'id' ? 'Enter your ID number' : 'Enter your passport/permit number'}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label htmlFor="nationality" className="block mb-2">
                Nationality *
              </label>
              <input
                type="text"
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                placeholder="Enter your nationality"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block mb-2">
                Physical Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, city, postal code"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            {/* Password */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="flex items-start gap-3">
                <input type="checkbox" className="mt-1" required />
                <span className="text-sm text-gray-700">
                  I agree to the terms and conditions and understand that this platform facilitates
                  access to private healthcare and education services through monthly contributions.
                </span>
              </label>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                <AlertCircle className="size-5 shrink-0" /> {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="aa-btn w-full bg-emerald-600 text-white p-4 rounded-lg hover:bg-emerald-700 inline-flex items-center justify-center gap-2"
            >
              {submitting && <Spinner />} {submitting ? 'Creating your account…' : 'Register'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 hover:text-emerald-700">
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}