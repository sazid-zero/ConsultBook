// Consultant Types - Global immutable categories
export const CONSULTANT_TYPES = {
  medical: "Medical Consultant",
  legal: "Legal Consultant",
  financial: "Financial Advisor",
  technical: "Technical Consultant",
  business: "Business Consultant",
  career: "Career Coach",
  wellness: "Wellness Expert",
  education: "Education Specialist",
  marketing: "Marketing Consultant",
  other: "Other",
} as const

export type ConsultantType = keyof typeof CONSULTANT_TYPES

// Qualification with certificate for admin review
export interface Qualification {
  id: string
  name: string
  certificateUrl: string
  certificateFilename: string
  status: "pending" | "approved" | "rejected"
  reviewedBy?: string
  reviewedAt?: string
  rejectionReason?: string
}

// Portfolio item for case studies
export interface PortfolioItem {
  id: string
  title: string
  description: string
  imageUrl?: string
}

// Certification for profile
export interface Certification {
  id: string
  name: string
  issuer: string
  year: number
}

// Education for profile
export interface Education {
  id: string
  degree: string
  university: string
  year: number
}

// Social links for profile
export interface SocialLinks {
  linkedin?: string
  twitter?: string
  website?: string
  instagram?: string
}

// Complete consultant profile
export interface ConsultantProfile {
  uid: string
  email: string
  name: string
  phone: string
  profilePhoto?: string
  role: "consultant"
  
  // Immutable (set at registration, cannot be changed)
  consultantType: ConsultantType
  
  // Updatable
  specializations: string[] // e.g., ["Cardiac Surgery", "Pediatrics"]
  address: string
  city: string
  state: string
  country: string
  
  // Qualifications (require admin approval)
  qualifications: Qualification[]
  
  // Profile enhancements (manually added after approval)
  certifications?: Certification[]
  qualifications_education?: Education[] // Renamed to avoid conflict
  portfolioItems?: PortfolioItem[]
  socialLinks?: SocialLinks
  
  // Metadata
  approved: boolean // Overall account approval
  verified?: boolean // Verified badge status
  hoursDelivered?: number
  ratingCount?: number
  averageRating?: number
  
  createdAt: string
  updatedAt?: string
}

// User data in auth context (lighter version)
export interface UserData {
  uid: string
  email: string
  role: "client" | "consultant" | "admin"
  name: string
  approved?: boolean
  profilePhoto?: string
  phone?: string
  consultantType?: ConsultantType
  createdAt?: string
}
