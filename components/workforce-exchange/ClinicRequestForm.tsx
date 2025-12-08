'use client'

import { useState } from 'react'
import { Calendar, Clock, MapPin, DollarSign, HelpCircle } from 'lucide-react'
import Explainer from '../Explainer'

interface ClinicRequestFormProps {
  clinicId: string
  clinicLocation: {
    city: string
    state: string
    zipCode: string
  }
  onSubmit: (request: any) => void
}

export default function ClinicRequestForm({
  clinicId,
  clinicLocation,
  onSubmit,
}: ClinicRequestFormProps) {
  const [formData, setFormData] = useState({
    role: '' as 'NP' | 'PA' | 'RN' | 'IV_Nurse' | 'Phlebotomist' | 'Hormone_Specialist' | '',
    skills: [] as string[],
    coverageType: '' as 'Single_Shift' | 'Multi_Day' | 'Weekly' | 'Telemedicine' | '',
    startDate: '',
    endDate: '',
    hoursNeeded: 8,
    rateRange: {
      min: '',
      max: '',
    },
    notes: '',
    priority: 'Standard' as 'Standard' | 'Priority' | 'Urgent',
  })

  const availableSkills = ['TRT', 'GLP-1', 'Peptides', 'Weight_Loss', 'IV_Therapy']

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      clinicId,
      clinicLocation,
      rateRange: formData.rateRange.min && formData.rateRange.max
        ? {
            min: parseFloat(formData.rateRange.min),
            max: parseFloat(formData.rateRange.max),
          }
        : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Practitioner Role */}
      <div>
        <Explainer
          title="Practitioner Role"
          what="Select the type of healthcare practitioner you need for this request."
          why="Different roles have different scopes of practice and certifications. This ensures proper matching."
          how={[
            'NP = Nurse Practitioner (can prescribe)',
            'PA = Physician Assistant (can prescribe)',
            'RN = Registered Nurse (clinical care)',
            'IV Nurse = Specialized in IV therapy administration',
            'Phlebotomist = Blood draws and lab work',
            'Hormone Specialist = Advanced hormone therapy expertise',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Practitioner Role <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
          required
          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
        >
          <option value="">Select Role</option>
          <option value="NP">Nurse Practitioner (NP)</option>
          <option value="PA">Physician Assistant (PA)</option>
          <option value="RN">Registered Nurse (RN)</option>
          <option value="IV_Nurse">IV Nurse</option>
          <option value="Phlebotomist">Phlebotomist</option>
          <option value="Hormone_Specialist">Hormone Specialist</option>
        </select>
      </div>

      {/* Required Skills */}
      <div>
        <Explainer
          title="Required Skills"
          what="Select the specific clinical skills required for this position."
          why="Matching is based on practitioner experience with these specific areas. More specific = better matches."
          how={[
            'TRT = Testosterone Replacement Therapy expertise',
            'GLP-1 = GLP-1 agonist administration experience',
            'Peptides = Peptide therapy knowledge',
            'Weight Loss = Weight management protocols',
            'IV Therapy = IV infusion administration',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Required Skills <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <div className="flex flex-wrap gap-2">
          {availableSkills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                formData.skills.includes(skill)
                  ? 'bg-primary/20 border-primary/50 text-primary'
                  : 'bg-dark-accent border-dark-border text-gray-300 hover:border-primary/30'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Coverage Type */}
      <div>
        <Explainer
          title="Coverage Type"
          what="Select the duration and type of coverage needed."
          why="Different coverage types have different matching algorithms and pricing structures."
          how={[
            'Single Shift = One day of coverage',
            'Multi-Day = Multiple consecutive days',
            'Weekly = Recurring weekly coverage',
            'Telemedicine = Remote/virtual coverage',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Coverage Type <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <select
          value={formData.coverageType}
          onChange={(e) => setFormData({ ...formData, coverageType: e.target.value as any })}
          required
          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
        >
          <option value="">Select Coverage Type</option>
          <option value="Single_Shift">Single Shift</option>
          <option value="Multi_Day">Multi-Day</option>
          <option value="Weekly">Weekly</option>
          <option value="Telemedicine">Telemedicine</option>
        </select>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
            min={formData.startDate || new Date().toISOString().split('T')[0]}
            className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Hours Needed */}
      <div>
        <Explainer
          title="Hours Needed"
          what="Total number of hours of coverage needed for this request."
          why="Used to calculate cost and match with practitioner availability."
          how={[
            'Standard shift = 8 hours',
            'Extended coverage = 12+ hours',
            'Part-time = 4-6 hours',
            'Hours are used for cost estimation',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Hours Needed <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <input
          type="number"
          min="1"
          max="24"
          value={formData.hoursNeeded}
          onChange={(e) => setFormData({ ...formData, hoursNeeded: parseInt(e.target.value) || 8 })}
          required
          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
        />
      </div>

      {/* Location (Auto-filled) */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Location</label>
        <div className="flex items-center gap-2 bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-gray-300">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>
            {clinicLocation.city}, {clinicLocation.state} {clinicLocation.zipCode}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">Auto-filled from clinic profile</p>
      </div>

      {/* Rate Range (Optional) */}
      <div>
        <Explainer
          title="Rate Range (Optional)"
          what="Optional budget range for this request. Helps filter practitioners within your budget."
          why="Leaving empty shows all available practitioners. Setting a range helps focus on affordable options."
          how={[
            'Rate is per hour',
            'Leave empty to see all practitioners',
            'AI will prioritize matches within range',
            'Actual rate is negotiated with practitioner',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Rate Range (Optional) <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Min $/hr"
            value={formData.rateRange.min}
            onChange={(e) =>
              setFormData({
                ...formData,
                rateRange: { ...formData.rateRange, min: e.target.value },
              })
            }
            className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
          <input
            type="number"
            placeholder="Max $/hr"
            value={formData.rateRange.max}
            onChange={(e) =>
              setFormData({
                ...formData,
                rateRange: { ...formData.rateRange, max: e.target.value },
              })
            }
            className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Priority */}
      <div>
        <Explainer
          title="Request Priority"
          what="Set the urgency level of this request. Priority requests get matched faster and appear higher in practitioner queues."
          why="Urgent requests may have higher matching fees but ensure faster placement."
          how={[
            'Standard = Normal processing (24-48 hours)',
            'Priority = Faster matching (12-24 hours), +$50 fee',
            'Urgent = Immediate matching (<12 hours), +$150 fee',
          ]}
        >
          <label className="block text-sm font-medium text-white mb-2">
            Priority <HelpCircle className="w-4 h-4 inline-block text-gray-400 ml-1" />
          </label>
        </Explainer>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
        >
          <option value="Standard">Standard</option>
          <option value="Priority">Priority (+$50 fee)</option>
          <option value="Urgent">Urgent (+$150 fee)</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Additional Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional requirements or information..."
          rows={3}
          className="w-full bg-dark-accent border border-dark-border rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors"
      >
        Submit Request & Find Matches
      </button>
    </form>
  )
}

