/**
 * Global Taxonomies and Settings
 * 
 * Editable taxonomies that control platform-wide content
 */

export interface TreatmentType {
  id: string
  name: string // e.g., "TRT", "GLP-1"
  display_name: string
  description?: string
  icon?: string
  order: number
}

export interface ConditionTag {
  id: string
  name: string // e.g., "Low T", "ED", "Brain Fog"
  category: 'symptom' | 'condition' | 'goal'
  order: number
}

export interface LifestyleTag {
  id: string
  name: string // e.g., "Executive", "Athlete", "High-Stress Professional"
  order: number
}

export interface SEOTemplate {
  id: string
  type: 'clinic_page' | 'marketplace_category' | 'city_page'
  template_name: string
  title_template: string // e.g., "{Clinic Name} - Men's Health in {City}"
  meta_description_template: string
  variables: string[] // e.g., ["Clinic Name", "City"]
}

export interface GlobalTaxonomies {
  treatment_types: TreatmentType[]
  condition_tags: ConditionTag[]
  lifestyle_tags: LifestyleTag[]
  seo_templates: SEOTemplate[]
  last_updated: Date
}

