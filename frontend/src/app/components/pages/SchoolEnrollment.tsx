import { useEffect, useState } from 'react';
import { Upload, AlertCircle, Send, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { useSearchParams, Link } from 'react-router-dom';
import { tokenStore } from '../../lib/api';
import { EASE, Spinner, useRevealChildren } from '../motion';

const DRAFT_KEY = 'aa_enrollment_draft';

export function SchoolEnrollment() {
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string; message: string } | null>(null);
  const [params] = useSearchParams();
  const revealRef = useRevealChildren();
  const [formData, setFormData] = useState({
    // Office Use
    waitingListNo: '',
    registerClass: '',
    signature: '',
    admissionNo: '',
    enrolmentDate: '',
    familyCode: '',
    
    // Sibling Info
    hasSiblings: '',
    siblingNames: '',
    
    // Parent 1 (Father)
    parent1Title: '',
    parent1FullNames: '',
    parent1Surname: '',
    parent1Initials: '',
    parent1PreferredName: '',
    parent1MaritalStatus: '',
    parent1Nationality: '',
    parent1DOB: '',
    parent1IDNo: '',
    parent1PassportNo: '',
    parent1AsylumSeeker: '',
    parent1PermitNo: '',
    parent1PermitExpiry: '',
    parent1Gender: '',
    parent1HomeLanguage: '',
    parent1CommPref: '',
    parent1Mobile: '',
    parent1Home: '',
    parent1Email: '',
    parent1ResidentialAddress: '',
    parent1PostalAddress: '',
    parent1OccupationStatus: '',
    parent1Occupation: '',
    parent1Employer: '',
    parent1WorkTel: '',
    parent1EmployerAddress: '',
    parent1LivesWithLearner: '',
    
    // Parent 2 (Mother)
    parent2Title: '',
    parent2FullNames: '',
    parent2Surname: '',
    parent2Initials: '',
    parent2PreferredName: '',
    parent2MaritalStatus: '',
    parent2Nationality: '',
    parent2DOB: '',
    parent2IDNo: '',
    parent2PassportNo: '',
    parent2AsylumSeeker: '',
    parent2PermitNo: '',
    parent2PermitExpiry: '',
    parent2Gender: '',
    parent2HomeLanguage: '',
    parent2CommPref: '',
    parent2Mobile: '',
    parent2Home: '',
    parent2Email: '',
    parent2ResidentialAddress: '',
    parent2PostalAddress: '',
    parent2OccupationStatus: '',
    parent2Occupation: '',
    parent2Employer: '',
    parent2WorkTel: '',
    parent2EmployerAddress: '',
    parent2LivesWithLearner: '',
    
    // Consent
    consentA: false,
    consentB: false,
    consentC: false,
    consentD: false,
    consentE: false,
    childName: '',
    parentGuardianName: '',
    parentGuardianSignature: '',
    consentDate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Restore a locally saved draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setFormData((prev) => ({ ...prev, ...JSON.parse(raw) }));
        toast.info('Your saved draft has been restored.');
      }
    } catch { /* ignore */ }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      toast.success('Draft saved on this device. You can come back and finish later.');
    } catch {
      toast.error('Could not save a draft in this browser.');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPhotoFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData();
    fd.append('data', JSON.stringify(formData));
    const schoolId = params.get('school');
    if (schoolId) fd.append('schoolId', schoolId);
    if (photoFile) fd.append('photo', photoFile);
    try {
      const base = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') || '';
      const t = tokenStore.get();
      const res = await fetch(`${base}/api/enrollments`, { method: 'POST', body: fd, headers: t ? { Authorization: `Bearer ${t}` } : {} });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setDone({ reference: data.reference, message: data.message });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-gray-50 py-16 min-h-[70vh]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }} className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-10 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 13, delay: 0.15 }} className="size-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="size-9" />
          </motion.div>
          <h2 className="text-2xl font-display font-semibold mb-2">Enrollment Submitted</h2>
          <p className="text-gray-600 mb-5">{done.message}</p>
          <p className="text-sm text-gray-500">Your reference</p>
          <p className="font-mono text-xl text-emerald-700 mb-8">{done.reference}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/find-school" className="aa-btn bg-gray-700 text-white px-6 py-3 rounded-lg">Find a School</Link>
            <Link to="/dashboard" className="aa-btn bg-blue-600 text-white px-6 py-3 rounded-lg">My Dashboard</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const occupationStatuses = [
    'Contract worker',
    'Full time employed',
    'Housewife',
    'Part-time employed',
    'Pensioner',
    'Self-employed non-professional',
    'Own-employed professional',
    'Student',
    'Temporary employment',
    'Unemployed',
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={revealRef} className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="mb-2">RIETONDALE HIGH SCHOOL</h1>
            <h2 className="mb-4">ENROLMENT FORM – 2025</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 text-left">
              <p className="text-yellow-800">PLEASE COMPLETE WITH A BLACK PEN</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Photo and Office Use Section */}
            <div className="grid md:grid-cols-2 gap-8 border-b pb-6">
              {/* Photo Upload */}
              <div>
                <h3 className="mb-4">PHOTO</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="relative">
                      <img src={photoPreview} alt="Learner" className="w-48 h-48 object-cover mx-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview('')}
                        className="mt-4 text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="size-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Upload Learner Photo</p>
                      <p className="text-sm text-gray-500">Click to select file</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Office Use Only */}
              <div>
                <h3 className="mb-4">FOR OFFICE USE</h3>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Waiting list no:</label>
                      <input
                        type="text"
                        name="waitingListNo"
                        value={formData.waitingListNo}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-white"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Register class:</label>
                      <input
                        type="text"
                        name="registerClass"
                        value={formData.registerClass}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-white"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Signature:</label>
                    <input
                      type="text"
                      name="signature"
                      value={formData.signature}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded bg-white"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm mb-1">Admission no:</label>
                      <input
                        type="text"
                        name="admissionNo"
                        value={formData.admissionNo}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-white"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">Enrolment date:</label>
                      <input
                        type="text"
                        name="enrolmentDate"
                        value={formData.enrolmentDate}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded bg-white"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Family code:</label>
                    <input
                      type="text"
                      name="familyCode"
                      value={formData.familyCode}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded bg-white"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admission Requirements */}
            <section className="border-b pb-6">
              <h2 className="mb-4">ADMISSION REQUIREMENTS</h2>
              <div className="bg-blue-50 p-6 rounded-lg space-y-3 text-sm">
                <ol className="list-decimal list-inside space-y-2">
                  <li>The medium of instruction is English. Learners must provide proof that they are fluent in English Home Language and Afrikaans First Additional Language.</li>
                  <li>No entry test will be written.</li>
                  <li>Learners who permanently reside in the area for which the School is the nearest suitable school, will be given preference.
                    <p className="ml-6 mt-1 text-xs">* IF SPACE PERMITS, following the application of this criteria, preference will be given to learners whose parents work in the direct area of the school (proof has to be supplied) followed by siblings.</p>
                  </li>
                  <li>A learner may appeal if his/her application is turned down (Schools Act section 5(9) 1996).</li>
                  <li>Learners must meet the age requirements as determined by the Gauteng Department of Education for each grade.</li>
                  <li>The compulsory school fees, which are determined by the Governing Body, should be paid as stipulated.</li>
                  <li>The completed form, together with all the requested supportive documentation must be handed in at security.</li>
                  <li>Effective communication with you is a priority for us. We make use of the d6 Connect App. This application simplifies communication and enables us to share relevant important notices/announcements, resources and calendar events. We will also be able to notify of any absenteeism and misconduct with regards to your child.</li>
                </ol>
              </div>
            </section>

            {/* Required Documentation */}
            <section className="border-b pb-6">
              <div className="bg-amber-50 border-l-4 border-amber-600 p-6">
                <h3 className="mb-3">NB: Kindly attach the following documentation:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Proof of residential address (original/certified copy of municipal account OR formal lease agreement)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Certified copy of learner's original unabridged birth certificate;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Latest school report (Original/certified copy).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Certified copies of both parents'/guardians' identity documents;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Transfer card from previous school (only when approved);</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Proof of employment on an original letterhead if you work in the area.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>Learners with immigrant status must also provide the following certified documentation: study permit; parents' ID documents; parents' work permit; If documentation is not available submit proof that he or she has applied for the necessary documentation.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>In case of foster care, a copy of the court order;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600">✓</span>
                    <span>In case of divorce, a copy of the court order indicating guardianship.</span>
                  </li>
                </ul>
                <div className="mt-4 bg-red-50 p-3 rounded">
                  <p className="text-red-800">Please note that the application will only be processed if ALL of the above documents have been submitted.</p>
                </div>
              </div>
            </section>

            {/* Sibling Information */}
            <section className="border-b pb-6">
              <div className="mb-4">
                <label className="block mb-2">DO YOU HAVE ANY LEARNERS CURRENTLY/PREVIOUSLY IN THIS SCHOOL? *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSiblings"
                      value="yes"
                      checked={formData.hasSiblings === 'yes'}
                      onChange={handleInputChange}
                      required
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="hasSiblings"
                      value="no"
                      checked={formData.hasSiblings === 'no'}
                      onChange={handleInputChange}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
              {formData.hasSiblings === 'yes' && (
                <div>
                  <label htmlFor="siblingNames" className="block mb-2">Name of sibling(s) in the school:</label>
                  <textarea
                    id="siblingNames"
                    name="siblingNames"
                    value={formData.siblingNames}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </section>

            {/* Parent 1 Information */}
            <section className="border-b pb-6">
              <h2 className="mb-4">BIOLOGICAL PARENT 1 / LEGAL GUARDIAN 1 INFORMATION (FATHER)</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="parent1Title" className="block mb-2 text-sm">Title *</label>
                    <select
                      id="parent1Title"
                      name="parent1Title"
                      value={formData.parent1Title}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Mr">Mr</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                      <option value="Rev">Rev</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label htmlFor="parent1FullNames" className="block mb-2 text-sm">Full names *</label>
                    <input
                      type="text"
                      id="parent1FullNames"
                      name="parent1FullNames"
                      value={formData.parent1FullNames}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent1Surname" className="block mb-2 text-sm">Surname *</label>
                    <input
                      type="text"
                      id="parent1Surname"
                      name="parent1Surname"
                      value={formData.parent1Surname}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1Initials" className="block mb-2 text-sm">Initials *</label>
                    <input
                      type="text"
                      id="parent1Initials"
                      name="parent1Initials"
                      value={formData.parent1Initials}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent1PreferredName" className="block mb-2 text-sm">Preferred name</label>
                    <input
                      type="text"
                      id="parent1PreferredName"
                      name="parent1PreferredName"
                      value={formData.parent1PreferredName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1MaritalStatus" className="block mb-2 text-sm">Marital status *</label>
                    <select
                      id="parent1MaritalStatus"
                      name="parent1MaritalStatus"
                      value={formData.parent1MaritalStatus}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="parent1Nationality" className="block mb-2 text-sm">Nationality *</label>
                    <input
                      type="text"
                      id="parent1Nationality"
                      name="parent1Nationality"
                      value={formData.parent1Nationality}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent1DOB" className="block mb-2 text-sm">Date of birth *</label>
                    <input
                      type="date"
                      id="parent1DOB"
                      name="parent1DOB"
                      value={formData.parent1DOB}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1IDNo" className="block mb-2 text-sm">ID no</label>
                    <input
                      type="text"
                      id="parent1IDNo"
                      name="parent1IDNo"
                      value={formData.parent1IDNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1PassportNo" className="block mb-2 text-sm">Passport no</label>
                    <input
                      type="text"
                      id="parent1PassportNo"
                      name="parent1PassportNo"
                      value={formData.parent1PassportNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="parent1AsylumSeeker" className="block mb-2 text-sm">Asylum seeker?</label>
                    <select
                      id="parent1AsylumSeeker"
                      name="parent1AsylumSeeker"
                      value={formData.parent1AsylumSeeker}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="parent1PermitNo" className="block mb-2 text-sm">Permit no</label>
                    <input
                      type="text"
                      id="parent1PermitNo"
                      name="parent1PermitNo"
                      value={formData.parent1PermitNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1PermitExpiry" className="block mb-2 text-sm">Permit expiry date</label>
                    <input
                      type="date"
                      id="parent1PermitExpiry"
                      name="parent1PermitExpiry"
                      value={formData.parent1PermitExpiry}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1Gender" className="block mb-2 text-sm">Gender *</label>
                    <select
                      id="parent1Gender"
                      name="parent1Gender"
                      value={formData.parent1Gender}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent1HomeLanguage" className="block mb-2 text-sm">Home language *</label>
                    <input
                      type="text"
                      id="parent1HomeLanguage"
                      name="parent1HomeLanguage"
                      value={formData.parent1HomeLanguage}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">Communication preference *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parent1CommPref"
                          value="SMS"
                          checked={formData.parent1CommPref === 'SMS'}
                          onChange={handleInputChange}
                          required
                        />
                        <span>SMS</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parent1CommPref"
                          value="Email"
                          checked={formData.parent1CommPref === 'Email'}
                          onChange={handleInputChange}
                        />
                        <span>E-mail</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent1Mobile" className="block mb-2 text-sm">Mobile no *</label>
                    <input
                      type="tel"
                      id="parent1Mobile"
                      name="parent1Mobile"
                      value={formData.parent1Mobile}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1Home" className="block mb-2 text-sm">Home no</label>
                    <input
                      type="tel"
                      id="parent1Home"
                      name="parent1Home"
                      value={formData.parent1Home}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1Email" className="block mb-2 text-sm">E-mail *</label>
                    <input
                      type="email"
                      id="parent1Email"
                      name="parent1Email"
                      value={formData.parent1Email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent1ResidentialAddress" className="block mb-2 text-sm">Residential address *</label>
                    <textarea
                      id="parent1ResidentialAddress"
                      name="parent1ResidentialAddress"
                      value={formData.parent1ResidentialAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent1PostalAddress" className="block mb-2 text-sm">Postal address</label>
                    <textarea
                      id="parent1PostalAddress"
                      name="parent1PostalAddress"
                      value={formData.parent1PostalAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Occupation Information Parent 1 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="mb-4">OCCUPATION INFORMATION</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="parent1OccupationStatus" className="block mb-2 text-sm">Occupation status *</label>
                      <select
                        id="parent1OccupationStatus"
                        name="parent1OccupationStatus"
                        value={formData.parent1OccupationStatus}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select</option>
                        {occupationStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="parent1Occupation" className="block mb-2 text-sm">Occupation</label>
                        <input
                          type="text"
                          id="parent1Occupation"
                          name="parent1Occupation"
                          value={formData.parent1Occupation}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parent1Employer" className="block mb-2 text-sm">Employer</label>
                        <input
                          type="text"
                          id="parent1Employer"
                          name="parent1Employer"
                          value={formData.parent1Employer}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="parent1WorkTel" className="block mb-2 text-sm">Work tel no</label>
                        <input
                          type="tel"
                          id="parent1WorkTel"
                          name="parent1WorkTel"
                          value={formData.parent1WorkTel}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parent1EmployerAddress" className="block mb-2 text-sm">Employer address</label>
                        <input
                          type="text"
                          id="parent1EmployerAddress"
                          name="parent1EmployerAddress"
                          value={formData.parent1EmployerAddress}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Does learner live with parent? *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="parent1LivesWithLearner"
                        value="yes"
                        checked={formData.parent1LivesWithLearner === 'yes'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="parent1LivesWithLearner"
                        value="no"
                        checked={formData.parent1LivesWithLearner === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Parent 2 Information - Similar structure */}
            <section className="border-b pb-6">
              <h2 className="mb-4">BIOLOGICAL PARENT 2 / LEGAL GUARDIAN 2 INFORMATION (MOTHER)</h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="parent2Title" className="block mb-2 text-sm">Title *</label>
                    <select
                      id="parent2Title"
                      name="parent2Title"
                      value={formData.parent2Title}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Ms">Ms</option>
                      <option value="Miss">Miss</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label htmlFor="parent2FullNames" className="block mb-2 text-sm">Full names *</label>
                    <input
                      type="text"
                      id="parent2FullNames"
                      name="parent2FullNames"
                      value={formData.parent2FullNames}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent2Surname" className="block mb-2 text-sm">Surname *</label>
                    <input
                      type="text"
                      id="parent2Surname"
                      name="parent2Surname"
                      value={formData.parent2Surname}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2Initials" className="block mb-2 text-sm">Initials *</label>
                    <input
                      type="text"
                      id="parent2Initials"
                      name="parent2Initials"
                      value={formData.parent2Initials}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent2PreferredName" className="block mb-2 text-sm">Preferred name</label>
                    <input
                      type="text"
                      id="parent2PreferredName"
                      name="parent2PreferredName"
                      value={formData.parent2PreferredName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2MaritalStatus" className="block mb-2 text-sm">Marital status *</label>
                    <select
                      id="parent2MaritalStatus"
                      name="parent2MaritalStatus"
                      value={formData.parent2MaritalStatus}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="parent2Nationality" className="block mb-2 text-sm">Nationality *</label>
                    <input
                      type="text"
                      id="parent2Nationality"
                      name="parent2Nationality"
                      value={formData.parent2Nationality}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent2DOB" className="block mb-2 text-sm">Date of birth *</label>
                    <input
                      type="date"
                      id="parent2DOB"
                      name="parent2DOB"
                      value={formData.parent2DOB}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2IDNo" className="block mb-2 text-sm">ID no</label>
                    <input
                      type="text"
                      id="parent2IDNo"
                      name="parent2IDNo"
                      value={formData.parent2IDNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2PassportNo" className="block mb-2 text-sm">Passport no</label>
                    <input
                      type="text"
                      id="parent2PassportNo"
                      name="parent2PassportNo"
                      value={formData.parent2PassportNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="parent2AsylumSeeker" className="block mb-2 text-sm">Asylum seeker?</label>
                    <select
                      id="parent2AsylumSeeker"
                      name="parent2AsylumSeeker"
                      value={formData.parent2AsylumSeeker}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="parent2PermitNo" className="block mb-2 text-sm">Permit no</label>
                    <input
                      type="text"
                      id="parent2PermitNo"
                      name="parent2PermitNo"
                      value={formData.parent2PermitNo}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2PermitExpiry" className="block mb-2 text-sm">Permit expiry date</label>
                    <input
                      type="date"
                      id="parent2PermitExpiry"
                      name="parent2PermitExpiry"
                      value={formData.parent2PermitExpiry}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2Gender" className="block mb-2 text-sm">Gender *</label>
                    <select
                      id="parent2Gender"
                      name="parent2Gender"
                      value={formData.parent2Gender}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent2HomeLanguage" className="block mb-2 text-sm">Home language *</label>
                    <input
                      type="text"
                      id="parent2HomeLanguage"
                      name="parent2HomeLanguage"
                      value={formData.parent2HomeLanguage}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">Communication preference *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parent2CommPref"
                          value="SMS"
                          checked={formData.parent2CommPref === 'SMS'}
                          onChange={handleInputChange}
                          required
                        />
                        <span>SMS</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="parent2CommPref"
                          value="Email"
                          checked={formData.parent2CommPref === 'Email'}
                          onChange={handleInputChange}
                        />
                        <span>E-mail</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="parent2Mobile" className="block mb-2 text-sm">Mobile no *</label>
                    <input
                      type="tel"
                      id="parent2Mobile"
                      name="parent2Mobile"
                      value={formData.parent2Mobile}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2Home" className="block mb-2 text-sm">Home no</label>
                    <input
                      type="tel"
                      id="parent2Home"
                      name="parent2Home"
                      value={formData.parent2Home}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2Email" className="block mb-2 text-sm">E-mail *</label>
                    <input
                      type="email"
                      id="parent2Email"
                      name="parent2Email"
                      value={formData.parent2Email}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="parent2ResidentialAddress" className="block mb-2 text-sm">Residential address *</label>
                    <textarea
                      id="parent2ResidentialAddress"
                      name="parent2ResidentialAddress"
                      value={formData.parent2ResidentialAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parent2PostalAddress" className="block mb-2 text-sm">Postal address</label>
                    <textarea
                      id="parent2PostalAddress"
                      name="parent2PostalAddress"
                      value={formData.parent2PostalAddress}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Occupation Information Parent 2 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="mb-4">OCCUPATION INFORMATION</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="parent2OccupationStatus" className="block mb-2 text-sm">Occupation status *</label>
                      <select
                        id="parent2OccupationStatus"
                        name="parent2OccupationStatus"
                        value={formData.parent2OccupationStatus}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select</option>
                        {occupationStatuses.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="parent2Occupation" className="block mb-2 text-sm">Occupation</label>
                        <input
                          type="text"
                          id="parent2Occupation"
                          name="parent2Occupation"
                          value={formData.parent2Occupation}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parent2Employer" className="block mb-2 text-sm">Employer</label>
                        <input
                          type="text"
                          id="parent2Employer"
                          name="parent2Employer"
                          value={formData.parent2Employer}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="parent2WorkTel" className="block mb-2 text-sm">Work tel no</label>
                        <input
                          type="tel"
                          id="parent2WorkTel"
                          name="parent2WorkTel"
                          value={formData.parent2WorkTel}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="parent2EmployerAddress" className="block mb-2 text-sm">Employer address</label>
                        <input
                          type="text"
                          id="parent2EmployerAddress"
                          name="parent2EmployerAddress"
                          value={formData.parent2EmployerAddress}
                          onChange={handleInputChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Does learner live with parent? *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="parent2LivesWithLearner"
                        value="yes"
                        checked={formData.parent2LivesWithLearner === 'yes'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="parent2LivesWithLearner"
                        value="no"
                        checked={formData.parent2LivesWithLearner === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Protection of Personal Information */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Protection of Personal Information</h2>
              <div className="bg-blue-50 p-6 rounded-lg space-y-4">
                <p className="mb-4">I/we, being the parent/s or legal guardian/s of the learner, consent to:</p>
                
                <div className="space-y-3">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentA"
                      checked={formData.consentA}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1"
                      required
                    />
                    <span className="text-sm">
                      <strong>a.</strong> my/our personal information being collected, processed and stored by the school in terms of the relevant provisions of the Protection of Personal Information Act 4 of 2013 (POPI) for purposes of the proper functioning, management and governance of the school, as prescribed in the South African Schools Act, 84 of 1996 and other relevant national and provincial educational legislation and policies, and
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentB"
                      checked={formData.consentB}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1"
                      required
                    />
                    <span className="text-sm">
                      <strong>b.</strong> the learner's personal information (including academic, attendance, behavioural and other school-related records) being collected, processed, shared and stored by the school in terms of the relevant provisions of the Protection of Personal Information Act 4 of 2013 (POPI) for purposes of enrolment of the learner in the school, the proper functioning, management and governance of the school, as prescribed in the South African Schools Act, 84 of 1996 and other relevant national and provincial educational legislation and policies.
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentC"
                      checked={formData.consentC}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1"
                      required
                    />
                    <span className="text-sm">
                      <strong>c.</strong> include photographs, with or without name, of your child in school publications/website/D6 Gallery or in press releases to celebrate your child's activities, achievements or successes.
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentD"
                      checked={formData.consentD}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1"
                      required
                    />
                    <span className="text-sm">
                      <strong>d.</strong> supply information and a reference in respect of your child to any educational institution which you propose your child may attend. We will take care to ensure that all information that is supplied relating to your child is accurate and any opinion given on his/her ability, aptitude and character is fair. However, the school cannot be liable for any loss you or your child is alleged to have suffered resulting from opinions reasonably given, or correct statements of fact contained, in any reference or report given by us.
                    </span>
                  </label>

                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      name="consentE"
                      checked={formData.consentE}
                      onChange={handleInputChange}
                      className="w-5 h-5 mt-1"
                      required
                    />
                    <span className="text-sm">
                      <strong>e.</strong> communicate with you via electronic means such as the SMS system or D6 communicator or class dojo etc.
                    </span>
                  </label>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <p>
                    <strong>2.</strong> I/we confirm that I/we have been informed that the abovementioned personal information will be dealt with in line with the school's POPI policy, which is available upon request to the school. I also confirm that I am aware that my/our rights with regards to the protection of my personal information is also detailed in this policy.
                  </p>

                  <p>
                    <strong>3.</strong> I/we confirm that I/we understand that it is my/our responsibility to inform the school as soon as any of the personal information I have provided herein changes and undertake to furnish the school with such amended information as soon as possible.
                  </p>

                  <p>
                    <strong>4.</strong> The school may not distribute or otherwise publish any of your personal information in its possession, unless you give your consent, in writing, to the school that it may do so. Should this be the case, the school may only distribute or otherwise publish the information specified in your consent to the people and for the purpose stated in your written consent.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label htmlFor="childName" className="block mb-2">NAME OF CHILD *</label>
                    <input
                      type="text"
                      id="childName"
                      name="childName"
                      value={formData.childName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentGuardianName" className="block mb-2">NAME OF PARENT/GUARDIAN *</label>
                    <input
                      type="text"
                      id="parentGuardianName"
                      name="parentGuardianName"
                      value={formData.parentGuardianName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="parentGuardianSignature" className="block mb-2">SIGNATURE OF PARENT/GUARDIAN *</label>
                    <input
                      type="text"
                      id="parentGuardianSignature"
                      name="parentGuardianSignature"
                      value={formData.parentGuardianSignature}
                      onChange={handleInputChange}
                      placeholder="Type your full name as signature"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="consentDate" className="block mb-2">DATE *</label>
                    <input
                      type="date"
                      id="consentDate"
                      name="consentDate"
                      value={formData.consentDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex flex-wrap gap-4 justify-end pt-6">
              <button
                type="button"
                onClick={saveDraft}
                className="aa-btn flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700"
              >
                <Save className="size-5" />
                Save Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="aa-btn flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
              >
                {submitting ? <Spinner /> : <Send className="size-5" />}
                {submitting ? 'Submitting…' : 'Submit Enrollment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
