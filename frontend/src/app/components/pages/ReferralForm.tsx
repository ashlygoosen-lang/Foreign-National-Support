import { useEffect, useState } from 'react';
import { FileText, AlertCircle, Save, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { EASE, Spinner, useRevealChildren } from '../motion';

const DRAFT_KEY = 'aa_referral_draft';

export function ReferralForm() {
  const [formData, setFormData] = useState({
    // Referring Information
    referringWorker: '',
    referringHospital: '',
    telephone: '',
    folderNo: '',
    date: '',
    dept: '',
    email: '',
    ward: '',
    
    // Reason for referral
    reasonRehabilitation: false,
    reasonTubeFeed: false,
    reasonOther: false,
    reasonOtherDesc: '',
    reasonNursingShort: false,
    reasonTerminalCare: false,
    reasonNursingLong: false,
    reasonRespite: false,
    
    selfReferral: '',
    knownToSocialWorker: '',
    socialWorkerName: '',
    socialWorkerContact: '',
    clientAware: '',
    
    // Next of Kin (multiple entries)
    nokRelationship1: '',
    nokName1: '',
    nokAddress1: '',
    nokPhone1: '',
    
    // Family Background
    homeLanguage: '',
    clientLivesAlone: false,
    clientLivesWith: '',
    clientLivesWithName: '',
    clientLivesWithRelationship: '',
    maritalStatus: '',
    spouseWorks: '',
    housingConditions: '',
    
    // Financial
    incomeSource: [] as string[],
    currentlyEmployed: '',
    returnToWork: '',
    monthlyIncome: '',
    pensionGrantLodged: '',
    pensionGrantWhere: '',
    pensionGrantWhen: '',
    medicalAid: '',
    medicalAidName: '',
    medicalAidNo: '',
    medicalAidRef: '',
    burialPolicy: '',
    burialPolicyName: '',
    burialPolicyValue: '',
    wcaRafClaim: '',
    wcaRafDate: '',
    
    // General
    clientCarerInformed: '',
    applicationLodged: '',
    institutionName: '',
    dateLodged: '',
    dateApproved: '',
    communityResources: '',
    dischargePlanning: '',
    infoCompletedBy: '',
    infoDesignation: '',
    infoContact: '',
    infoEmail: '',
    infoDate: '',
    
    // Medical Report
    medicalFormDelivery: '',
    admissionDate: '',
    dischargeDate: '',
    diagnosis: '',
    onsetDate: '',
    presentSymptoms: '',
    prognosis: '',
    clinicalSummary: '',
    investigations: '',
    surgicalInterventions: '',
    specialNeeds: '',
    onMedication: '',
    medicationList: '',
    followUpAppointments: '',
    medicalCompletedBy: '',
    medicalEmail: '',
    medicalContact: '',
    medicalDate: '',
    
    // Care Information
    clientKeenToHelp: '',
    previousRehabilitation: '',
    previousRehabDetails: '',
    
    // ADL assessments
    eating: '',
    dressing: '',
    washing: '',
    toileting: '',
    walking: '',
    wheelchairUser: '',
    propellingChair: '',
    transferChair: '',
    wheelchairOwnership: '',
    assistiveDevices: '',
    assistiveDevicesType: '',
    
    careCompletedBy: '',
    careCompletedByType: '',
    careEmail: '',
    careContact: '',
    careDate: '',
    
    // Functional Report
    generalStatus: '',
    respiration: '',
    sight: '',
    hearing: '',
    speech: '',
    bladderBowel: '',
    
    // Physical Status - Muscle Power
    musclePowerTrunkLeft: '',
    musclePowerTrunkRight: '',
    musclePowerUpperLeft: '',
    musclePowerUpperRight: '',
    musclePowerLowerLeft: '',
    musclePowerLowerRight: '',
    
    // Basic Tone
    toneTrunkLeft: '',
    toneTrunkRight: '',
    toneUpperLeft: '',
    toneUpperRight: '',
    toneLowerLeft: '',
    toneLowerRight: '',
    
    // Sensation
    sensationTrunkLeft: '',
    sensationTrunkRight: '',
    sensationUpperLeft: '',
    sensationUpperRight: '',
    sensationLowerLeft: '',
    sensationLowerRight: '',
    
    // Contractures
    contracturesUpperLeft: '',
    contracturesUpperRight: '',
    contracturesLowerLeft: '',
    contracturesLowerRight: '',
    
    // Hand Function
    handGraspLeft: '',
    handGraspRight: '',
    handCoordLeft: '',
    handCoordRight: '',
    
    // Physical Ability
    abilityEating: '',
    abilityDressing: '',
    abilityWashing: '',
    abilityToileting: '',
    abilityWalking: '',
    abilityWheelchairUser: '',
    abilityPropelling: '',
    abilityTransfer: '',
    
    wheelchairType: '',
    wheelchairCushion: '',
    ambulationDevices: '',
    ambulationDistance: '',
    
    mentalOrientated: '',
    mentalMemory: '',
    motivation: '',
    
    physioCompletedBy: '',
    physioEmail: '',
    physioContact: '',
    physioDate: '',
    
    otCompletedBy: '',
    otEmail: '',
    otContact: '',
    otDate: '',
    
    speechCompletedBy: '',
    speechEmail: '',
    speechContact: '',
    speechDate: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<{ reference: string; message: string } | null>(null);
  const revealRef = useRevealChildren();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        setFormData((prev: any) => ({ ...prev, ...JSON.parse(raw) }));
        toast.info('Your saved draft has been restored.');
      }
    } catch { /* ignore */ }
  }, []);

  const saveDraft = () => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      toast.success('Draft saved on this device.');
    } catch {
      toast.error('Could not save a draft in this browser.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIncomeSourceChange = (source: string) => {
    setFormData(prev => ({
      ...prev,
      incomeSource: prev.incomeSource.includes(source)
        ? prev.incomeSource.filter(s => s !== source)
        : [...prev.incomeSource, source]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const r = await api('/referrals', { method: 'POST', json: { data: formData } });
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
      setDone(r);
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
          <h2 className="text-2xl font-display font-semibold mb-2">Referral Submitted</h2>
          <p className="text-gray-600 mb-5">{done.message}</p>
          <p className="text-sm text-gray-500">Reference</p>
          <p className="font-mono text-xl text-emerald-700 mb-8">{done.reference}</p>
          <Link to="/dashboard" className="aa-btn inline-flex bg-blue-600 text-white px-6 py-3 rounded-lg">Back to Dashboard</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div ref={revealRef} className="bg-white rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-100 p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="size-8 text-white" />
            </div>
            <h1 className="mb-2">Referral to Rehabilitation or Long Term Facility</h1>
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">THE COMPLETION OF THIS SECTION IS COMPULSORY</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Referring Health Worker Section */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Referring Health Worker Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="referringWorker" className="block mb-2">Referring health worker: *</label>
                  <input
                    type="text"
                    id="referringWorker"
                    name="referringWorker"
                    value={formData.referringWorker}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="referringHospital" className="block mb-2">Referring Hospital / Clinic: *</label>
                  <input
                    type="text"
                    id="referringHospital"
                    name="referringHospital"
                    value={formData.referringHospital}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="telephone" className="block mb-2">Tel: *</label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="folderNo" className="block mb-2">Hospital / CHC folder no:</label>
                  <input
                    type="text"
                    id="folderNo"
                    name="folderNo"
                    value={formData.folderNo}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="date" className="block mb-2">Date: *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="dept" className="block mb-2">Dept:</label>
                  <input
                    type="text"
                    id="dept"
                    name="dept"
                    value={formData.dept}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2">E-mail address:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="ward" className="block mb-2">Ward:</label>
                  <input
                    type="text"
                    id="ward"
                    name="ward"
                    value={formData.ward}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </section>

            {/* Reason for Referral */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Reason for referral – please tick the most appropriate block(s) *</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="reasonRehabilitation"
                      checked={formData.reasonRehabilitation}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Rehabilitation</span>
                  </label>
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      name="reasonTubeFeed"
                      checked={formData.reasonTubeFeed}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Tube feed</span>
                  </label>
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      name="reasonOther"
                      checked={formData.reasonOther}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Other (describe)</span>
                  </label>
                  {formData.reasonOther && (
                    <input
                      type="text"
                      name="reasonOtherDesc"
                      value={formData.reasonOtherDesc}
                      onChange={handleInputChange}
                      placeholder="Describe other reason"
                      className="w-full p-2 border border-gray-300 rounded-lg ml-6"
                    />
                  )}
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="reasonNursingShort"
                      checked={formData.reasonNursingShort}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Nursing care: short term</span>
                  </label>
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      name="reasonTerminalCare"
                      checked={formData.reasonTerminalCare}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Terminal care</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="reasonNursingLong"
                      checked={formData.reasonNursingLong}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Nursing care: long term</span>
                  </label>
                  <label className="flex items-center gap-2 ml-6">
                    <input
                      type="checkbox"
                      name="reasonRespite"
                      checked={formData.reasonRespite}
                      onChange={handleInputChange}
                      className="w-5 h-5"
                    />
                    <span>Respite</span>
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block mb-2">Is this a self-referral? *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="selfReferral"
                        value="yes"
                        checked={formData.selfReferral === 'yes'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="selfReferral"
                        value="no"
                        checked={formData.selfReferral === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block mb-2">Is this client known to a social worker? *</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="knownToSocialWorker"
                        value="yes"
                        checked={formData.knownToSocialWorker === 'yes'}
                        onChange={handleInputChange}
                        required
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="knownToSocialWorker"
                        value="no"
                        checked={formData.knownToSocialWorker === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>

              {formData.knownToSocialWorker === 'yes' && (
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="socialWorkerName" className="block mb-2">Social Worker Name:</label>
                    <input
                      type="text"
                      id="socialWorkerName"
                      name="socialWorkerName"
                      value={formData.socialWorkerName}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="socialWorkerContact" className="block mb-2">Contact details:</label>
                    <input
                      type="text"
                      id="socialWorkerContact"
                      name="socialWorkerContact"
                      value={formData.socialWorkerContact}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block mb-2">Is the client / next of kin aware of this application and the financial implications thereof? *</label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="clientAware"
                      value="yes"
                      checked={formData.clientAware === 'yes'}
                      onChange={handleInputChange}
                      required
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="clientAware"
                      value="no"
                      checked={formData.clientAware === 'no'}
                      onChange={handleInputChange}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>
            </section>

            {/* Next of Kin */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Next of Kin / Contact Person</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="nokRelationship1" className="block mb-2">Relationship</label>
                    <input
                      type="text"
                      id="nokRelationship1"
                      name="nokRelationship1"
                      value={formData.nokRelationship1}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nokName1" className="block mb-2">Name</label>
                    <input
                      type="text"
                      id="nokName1"
                      name="nokName1"
                      value={formData.nokName1}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nokAddress1" className="block mb-2">Address</label>
                    <input
                      type="text"
                      id="nokAddress1"
                      name="nokAddress1"
                      value={formData.nokAddress1}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nokPhone1" className="block mb-2">Telephone no.</label>
                    <input
                      type="tel"
                      id="nokPhone1"
                      name="nokPhone1"
                      value={formData.nokPhone1}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Family Background */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Family Background</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="homeLanguage" className="block mb-2">Home Language:</label>
                  <input
                    type="text"
                    id="homeLanguage"
                    name="homeLanguage"
                    value={formData.homeLanguage}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2">Client lives:</label>
                  <div className="flex gap-6 items-center flex-wrap">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="clientLivesAlone"
                        checked={formData.clientLivesAlone}
                        onChange={handleInputChange}
                        className="w-5 h-5"
                      />
                      <span>Alone</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="clientLivesWith"
                        checked={!!formData.clientLivesWith}
                        onChange={(e) => setFormData(prev => ({ ...prev, clientLivesWith: e.target.checked ? 'yes' : '' }))}
                        className="w-5 h-5"
                      />
                      <span>With</span>
                    </label>
                    {formData.clientLivesWith && (
                      <>
                        <input
                          type="text"
                          name="clientLivesWithName"
                          placeholder="Name"
                          value={formData.clientLivesWithName}
                          onChange={handleInputChange}
                          className="p-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="text"
                          name="clientLivesWithRelationship"
                          placeholder="Relationship"
                          value={formData.clientLivesWithRelationship}
                          onChange={handleInputChange}
                          className="p-2 border border-gray-300 rounded-lg"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Client's marital status:</label>
                  <div className="flex gap-6 flex-wrap">
                    {['Married', 'Divorced', 'Single', 'Widowed'].map(status => (
                      <label key={status} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value={status}
                          checked={formData.maritalStatus === status}
                          onChange={handleInputChange}
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Does Spouse work?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="spouseWorks"
                        value="yes"
                        checked={formData.spouseWorks === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="spouseWorks"
                        value="no"
                        checked={formData.spouseWorks === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Housing Conditions:</label>
                  <div className="flex gap-6 flex-wrap">
                    {['Boarding', 'Self Owned', 'Rented', 'No fixed Abode'].map(housing => (
                      <label key={housing} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="housingConditions"
                          value={housing}
                          checked={formData.housingConditions === housing}
                          onChange={handleInputChange}
                        />
                        <span>{housing}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Financial Circumstances */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Financial Circumstances</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Applicant is in receipt of:</label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {['Work pension', 'Old age pension', 'Disability grant', 'Maintenance grant', "Attendant's allowance", 'Other'].map(source => (
                      <label key={source} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.incomeSource.includes(source)}
                          onChange={() => handleIncomeSourceChange(source)}
                          className="w-5 h-5"
                        />
                        <span>{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Is the client currently employed?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="currentlyEmployed"
                          value="yes"
                          checked={formData.currentlyEmployed === 'yes'}
                          onChange={handleInputChange}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="currentlyEmployed"
                          value="no"
                          checked={formData.currentlyEmployed === 'no'}
                          onChange={handleInputChange}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Is the client expected to return to work?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="returnToWork"
                          value="yes"
                          checked={formData.returnToWork === 'yes'}
                          onChange={handleInputChange}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="returnToWork"
                          value="no"
                          checked={formData.returnToWork === 'no'}
                          onChange={handleInputChange}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Monthly income:</label>
                  <div className="flex gap-6 flex-wrap">
                    {['R0 – R4000', 'R4001 – R8000', 'More than R8000'].map(range => (
                      <label key={range} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="monthlyIncome"
                          value={range}
                          checked={formData.monthlyIncome === range}
                          onChange={handleInputChange}
                        />
                        <span>{range}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Has application for pension / grant been lodged?</label>
                  <div className="flex gap-6 mb-2">
                    {['Yes', 'No', 'N/A'].map(option => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="pensionGrantLodged"
                          value={option}
                          checked={formData.pensionGrantLodged === option}
                          onChange={handleInputChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {formData.pensionGrantLodged === 'Yes' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="pensionGrantWhere"
                        placeholder="Where"
                        value={formData.pensionGrantWhere}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        name="pensionGrantWhen"
                        placeholder="When"
                        value={formData.pensionGrantWhen}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2">Is client on a medical aid?</label>
                  <div className="flex gap-6 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="medicalAid"
                        value="yes"
                        checked={formData.medicalAid === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="medicalAid"
                        value="no"
                        checked={formData.medicalAid === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {formData.medicalAid === 'yes' && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="medicalAidName"
                        placeholder="Name of Medical aid"
                        value={formData.medicalAidName}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        name="medicalAidNo"
                        placeholder="No. of Medical aid"
                        value={formData.medicalAidNo}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        name="medicalAidRef"
                        placeholder="Membership Ref."
                        value={formData.medicalAidRef}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2">Does the applicant have a burial policy?</label>
                  <div className="flex gap-6 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="burialPolicy"
                        value="yes"
                        checked={formData.burialPolicy === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="burialPolicy"
                        value="no"
                        checked={formData.burialPolicy === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {formData.burialPolicy === 'yes' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="burialPolicyName"
                        placeholder="Name"
                        value={formData.burialPolicyName}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="text"
                        name="burialPolicyValue"
                        placeholder="Value"
                        value={formData.burialPolicyValue}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="wcaRafClaim" className="block mb-2">If relevant, WCA / RAF claim no.:</label>
                    <input
                      type="text"
                      id="wcaRafClaim"
                      name="wcaRafClaim"
                      value={formData.wcaRafClaim}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="wcaRafDate" className="block mb-2">Date of injury:</label>
                    <input
                      type="date"
                      id="wcaRafDate"
                      name="wcaRafDate"
                      value={formData.wcaRafDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* General Section */}
            <section className="border-b pb-6">
              <h2 className="mb-4">General</h2>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Have the client and carer been informed of the prognosis?</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="clientCarerInformed"
                        value="yes"
                        checked={formData.clientCarerInformed === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="clientCarerInformed"
                        value="no"
                        checked={formData.clientCarerInformed === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Has an application been lodged at any old age home / institution?</label>
                  <div className="flex gap-6 mb-2">
                    {['Yes', 'No', 'N/A'].map(option => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="applicationLodged"
                          value={option}
                          checked={formData.applicationLodged === option}
                          onChange={handleInputChange}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {formData.applicationLodged === 'Yes' && (
                    <div className="grid md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        name="institutionName"
                        placeholder="Name of institution"
                        value={formData.institutionName}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        name="dateLodged"
                        placeholder="Date lodged"
                        value={formData.dateLodged}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        name="dateApproved"
                        placeholder="Date approved"
                        value={formData.dateApproved}
                        onChange={handleInputChange}
                        className="p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="communityResources" className="block mb-2">Community resources contacted (specify):</label>
                  <textarea
                    id="communityResources"
                    name="communityResources"
                    value={formData.communityResources}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="dischargePlanning" className="block mb-2">Future planning regarding discharge:</label>
                  <textarea
                    id="dischargePlanning"
                    name="dischargePlanning"
                    value={formData.dischargePlanning}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="mb-3">Information completed by:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="infoCompletedBy" className="block mb-2">Name:</label>
                      <input
                        type="text"
                        id="infoCompletedBy"
                        name="infoCompletedBy"
                        value={formData.infoCompletedBy}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="infoDesignation" className="block mb-2">Designation:</label>
                      <input
                        type="text"
                        id="infoDesignation"
                        name="infoDesignation"
                        value={formData.infoDesignation}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="infoContact" className="block mb-2">Contact no:</label>
                      <input
                        type="tel"
                        id="infoContact"
                        name="infoContact"
                        value={formData.infoContact}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="infoEmail" className="block mb-2">E-mail address:</label>
                      <input
                        type="email"
                        id="infoEmail"
                        name="infoEmail"
                        value={formData.infoEmail}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="infoDate" className="block mb-2">Date:</label>
                      <input
                        type="date"
                        id="infoDate"
                        name="infoDate"
                        value={formData.infoDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Medical Report Information */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Medical Report Information</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 text-sm">
                  A medical practitioner must complete this section. The referral will only be considered with the relevant information.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2">If no medical practitioner is available, please indicate whether the client will:</label>
                  <div className="flex gap-6">
                    {['fax', 'post', 'deliver'].map(method => (
                      <label key={method} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="medicalFormDelivery"
                          value={method}
                          checked={formData.medicalFormDelivery === method}
                          onChange={handleInputChange}
                        />
                        <span>{method}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="admissionDate" className="block mb-2">Date of admission at referring hospital:</label>
                    <input
                      type="date"
                      id="admissionDate"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dischargeDate" className="block mb-2">Date of discharge from referring hospital:</label>
                    <input
                      type="date"
                      id="dischargeDate"
                      name="dischargeDate"
                      value={formData.dischargeDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="diagnosis" className="block mb-2">Diagnosis:</label>
                  <textarea
                    id="diagnosis"
                    name="diagnosis"
                    value={formData.diagnosis}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="onsetDate" className="block mb-2">Date of onset:</label>
                  <input
                    type="date"
                    id="onsetDate"
                    name="onsetDate"
                    value={formData.onsetDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="presentSymptoms" className="block mb-2">Present symptoms:</label>
                  <textarea
                    id="presentSymptoms"
                    name="presentSymptoms"
                    value={formData.presentSymptoms}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="prognosis" className="block mb-2">Prognosis:</label>
                  <textarea
                    id="prognosis"
                    name="prognosis"
                    value={formData.prognosis}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="clinicalSummary" className="block mb-2">Clinical summary: (Please attach, if possible, copies of RELEVANT investigations and reports)</label>
                  <textarea
                    id="clinicalSummary"
                    name="clinicalSummary"
                    value={formData.clinicalSummary}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="investigations" className="block mb-2">Please list all investigations done (as this avoids duplication). Please list all surgical interventions and dates.</label>
                  <textarea
                    id="investigations"
                    name="investigations"
                    value={formData.investigations}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="specialNeeds" className="block mb-2">Special needs regarding weight bearing and mobilization:</label>
                  <textarea
                    id="specialNeeds"
                    name="specialNeeds"
                    value={formData.specialNeeds}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2">Is the client on medication?</label>
                  <div className="flex gap-6 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="onMedication"
                        value="yes"
                        checked={formData.onMedication === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="onMedication"
                        value="no"
                        checked={formData.onMedication === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {formData.onMedication === 'yes' && (
                    <>
                      <p className="text-sm text-gray-600 mb-2">
                        If yes, please list below: (On discharge, one month's supply of current medication must accompany the client. 
                        Please indicate if medications need to be tapered or discontinued, and if so, when.)
                      </p>
                      <textarea
                        name="medicationList"
                        value={formData.medicationList}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </>
                  )}
                </div>

                <div>
                  <label htmlFor="followUpAppointments" className="block mb-2">Follow up appointments or readmission date at referring hospital:</label>
                  <textarea
                    id="followUpAppointments"
                    name="followUpAppointments"
                    value={formData.followUpAppointments}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="mb-3">Medical information completed by:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="medicalCompletedBy" className="block mb-2">Name:</label>
                      <input
                        type="text"
                        id="medicalCompletedBy"
                        name="medicalCompletedBy"
                        value={formData.medicalCompletedBy}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="medicalEmail" className="block mb-2">E-mail address:</label>
                      <input
                        type="email"
                        id="medicalEmail"
                        name="medicalEmail"
                        value={formData.medicalEmail}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="medicalContact" className="block mb-2">Contact no:</label>
                      <input
                        type="tel"
                        id="medicalContact"
                        name="medicalContact"
                        value={formData.medicalContact}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="medicalDate" className="block mb-2">Date:</label>
                      <input
                        type="date"
                        id="medicalDate"
                        name="medicalDate"
                        value={formData.medicalDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Care Information */}
            <section className="border-b pb-6">
              <h2 className="mb-4">Care Information</h2>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <p className="text-blue-800 text-sm">
                  A nursing professional should ideally complete this section.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2">Does it appear as if the client is keen to help him / herself?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="clientKeenToHelp"
                          value="yes"
                          checked={formData.clientKeenToHelp === 'yes'}
                          onChange={handleInputChange}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="clientKeenToHelp"
                          value="no"
                          checked={formData.clientKeenToHelp === 'no'}
                          onChange={handleInputChange}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-2">Have there been any previous attempts at rehabilitation?</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="previousRehabilitation"
                          value="yes"
                          checked={formData.previousRehabilitation === 'yes'}
                          onChange={handleInputChange}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="previousRehabilitation"
                          value="no"
                          checked={formData.previousRehabilitation === 'no'}
                          onChange={handleInputChange}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>

                {formData.previousRehabilitation === 'yes' && (
                  <div>
                    <label htmlFor="previousRehabDetails" className="block mb-2">Please provide further details:</label>
                    <textarea
                      id="previousRehabDetails"
                      name="previousRehabDetails"
                      value={formData.previousRehabDetails}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Activity</th>
                        <th className="border p-2">Totally dependant</th>
                        <th className="border p-2">Physical/Verbal help</th>
                        <th className="border p-2">Supervision</th>
                        <th className="border p-2">Independent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['eating', 'dressing', 'washing', 'toileting', 'walking'].map((activity) => (
                        <tr key={activity}>
                          <td className="border p-2 capitalize">{activity} / drinking</td>
                          {['totally', 'help', 'supervision', 'independent'].map((level) => (
                            <td key={level} className="border p-2 text-center">
                              <input
                                type="radio"
                                name={activity}
                                value={level}
                                checked={formData[activity as keyof typeof formData] === level}
                                onChange={handleInputChange}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div>
                  <label className="block mb-2">Is the client a wheelchair user?</label>
                  <div className="flex gap-6 mb-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="wheelchairUser"
                        value="yes"
                        checked={formData.wheelchairUser === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="wheelchairUser"
                        value="no"
                        checked={formData.wheelchairUser === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>

                  {formData.wheelchairUser === 'yes' && (
                    <div className="space-y-3 ml-6">
                      <div className="flex items-center gap-4">
                        <span className="w-48">Propelling of chair:</span>
                        {['totally', 'help', 'supervision', 'independent'].map((level) => (
                          <label key={level} className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="propellingChair"
                              value={level}
                              checked={formData.propellingChair === level}
                              onChange={handleInputChange}
                            />
                          </label>
                        ))}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="w-48">Transfer in / out of chair:</span>
                        {['totally', 'help', 'supervision', 'independent'].map((level) => (
                          <label key={level} className="flex items-center gap-1">
                            <input
                              type="radio"
                              name="transferChair"
                              value={level}
                              checked={formData.transferChair === level}
                              onChange={handleInputChange}
                            />
                          </label>
                        ))}
                      </div>
                      <div>
                        <label className="block mb-2">Ownership of a wheelchair:</label>
                        <div className="flex gap-6">
                          {['Bought', 'Rented', 'Loan', 'Provincial Government'].map((type) => (
                            <label key={type} className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="wheelchairOwnership"
                                value={type}
                                checked={formData.wheelchairOwnership === type}
                                onChange={handleInputChange}
                              />
                              <span>{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block mb-2">Are assistive devices used for walking?</label>
                  <div className="flex gap-6 mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="assistiveDevices"
                        value="yes"
                        checked={formData.assistiveDevices === 'yes'}
                        onChange={handleInputChange}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="assistiveDevices"
                        value="no"
                        checked={formData.assistiveDevices === 'no'}
                        onChange={handleInputChange}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {formData.assistiveDevices === 'yes' && (
                    <input
                      type="text"
                      name="assistiveDevicesType"
                      placeholder="If yes, what is used?"
                      value={formData.assistiveDevicesType}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="mb-3">Care information completed by:</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="careCompletedBy" className="block mb-2">Name:</label>
                      <input
                        type="text"
                        id="careCompletedBy"
                        name="careCompletedBy"
                        value={formData.careCompletedBy}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block mb-2">Professional Type:</label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="careCompletedByType"
                            value="nurse"
                            checked={formData.careCompletedByType === 'nurse'}
                            onChange={handleInputChange}
                          />
                          <span>Nurse</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="careCompletedByType"
                            value="family"
                            checked={formData.careCompletedByType === 'family'}
                            onChange={handleInputChange}
                          />
                          <span>Family member</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="careEmail" className="block mb-2">E-mail address:</label>
                      <input
                        type="email"
                        id="careEmail"
                        name="careEmail"
                        value={formData.careEmail}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="careContact" className="block mb-2">Contact no:</label>
                      <input
                        type="tel"
                        id="careContact"
                        name="careContact"
                        value={formData.careContact}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label htmlFor="careDate" className="block mb-2">Date:</label>
                      <input
                        type="date"
                        id="careDate"
                        name="careDate"
                        value={formData.careDate}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-end pt-6">
              <button type="button" onClick={saveDraft} className="aa-btn flex items-center gap-2 bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                <Save className="size-5" />
                Save Draft
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="aa-btn flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
              >
                {submitting ? <Spinner /> : <Send className="size-5" />}
                {submitting ? 'Submitting…' : 'Submit Referral'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
