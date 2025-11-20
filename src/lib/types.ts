export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  username?: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface AIRecommendation {
  recommendation: string;
  feasibilityScore: number;
  analysis: string;
  suggestions: string[];
  risks: string[];
}

export interface Location {
  id: string;
  coords: {
    lat: number;
    lng: number;
  };
  title: string;
  type:
    | "Pariwisata"
    | "Pertanian"
    | "Perikanan"
    | "UMKM"
    | "Infrastruktur"
    | "Aset Desa";
  kecamatan: string;
  desa: string;
  description: string;
  image: string;
  potential: "Sangat Tinggi" | "Tinggi" | "Sedang" | "Rendah";
  feasibility: number;
  kontak: string;
  fasilitas: string[];
  createdBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  // Tambahan field untuk AI
  aiRecommendation?: AIRecommendation;
  alamat?: string; // Tambahkan field alamat
}

export interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  image: string;
  progress: number;
  estimatedCapital: string;
  roi: string;
  tags: string[];
  feasibility: number;
  location: string;
  duration: string;
  createdBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface Approval {
  id: string;
  type: "location" | "investment";
  targetId: string;
  targetData: any;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

export interface InvestmentOpportunity {
  id: string;
  title: string;
  description: string;
  image: string;
  images?: string[]; // Untuk carousel
  progress: number;
  estimatedCapital: string;
  roi: string;
  tags: string[];
  feasibility: number;
  location: string;
  duration: string;
  createdBy: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;

  // Fields untuk detail page
  potentialProfit?: string;
  feasibilityLabel?: string;
  aiRecommendation?: string;
  detail?: {
    fullDescription: string;
    contact: string;
    aiAnalysis: {
      feasibility: string;
      estimatedROI: string;
      risk: string;
      opportunity: string;
    };
  };
  kecamatan?: string;
  sektor?: string;
}

export interface InvestmentFormData {
  title: string;
  description: string;
  image: string;
  images: string[];
  estimatedCapital: string;
  roi: string;
  tags: string[];
  feasibility: number;
  location: string;
  duration: string;
  kecamatan: string;
  sektor: string;
  potentialProfit: string;
  aiRecommendation: string;
  detail: {
    fullDescription: string;
    contact: string;
    aiAnalysis: {
      feasibility: string;
      estimatedROI: string;
      risk: string;
      opportunity: string;
    };
  };
}

export interface UploadState {
  mainImage: File | null;
  additionalImages: File[];
  uploading: boolean;
  uploadProgress: number;
}

// Tambahkan interface untuk Vercel Blob response
export interface BlobUploadResponse {
  url: string;
  downloadUrl?: string;
  pathname: string;
  contentType?: string;
  contentDisposition: string;
}

// Di file types.ts, perbarui interface Desa
export interface Desa {
  id: string;
  nama: string;
  kecamatan: string;
  deskripsi: string;
  gambar: string;
  koordinat: {
    lat: number;
    lng: number;
  };
  statistik: {
    penduduk: number;
    luas: number;
    umkm: number;
    pertanian: number;
  };
  asetTanah: string[];
  wisata: WisataItem[]; // Ubah dari string[] ke WisataItem[]
  bumdes: string[];
  produkUnggulan: string[];
  infrastruktur: {
    jalan: string;
    air: string;
    internet: string;
    sekolah: string;
    kesehatan: string;
    listrik: string;
  };
  peluangInvestasi: Array<{
    judul: string;
    deskripsi: string;
    estimasiBiaya: string;
    kontak: string;
  }>;
  galeri: string[];
  createdAt?: string;
  updatedAt?: string;
  aiInvestmentRecommendations?: InvestmentRecommendation;
}

// Tambahkan interface untuk WisataItem
export interface WisataItem {
  nama: string;
  gambar: string;
  deskripsi: string;
}

// Tambahkan interface ini di types.ts
export interface InvestmentRecommendation {
  recommendations: Array<{
    title: string;
    description: string;
    estimatedInvestment: string;
    potentialROI: string;
    timeframe: string;
    riskLevel: "Rendah" | "Sedang" | "Tinggi";
    keyAdvantages: string[];
    challenges: string[];
    targetMarket: string[];
  }>;
}

export interface InvestmentRecommendationItem {
  title: string;
  description: string;
  estimatedInvestment: string;
  potentialROI: string;
  timeframe: string;
  riskLevel: "Rendah" | "Sedang" | "Tinggi";
  keyAdvantages: string[];
  challenges: string[];
  targetMarket: string[];
}
// Tambahkan di types.ts
export enum AnalysisType {
  LOCATION_ANALYSIS = "location_analysis",
  INVESTMENT_RECOMMENDATION = "investment_recommendation",
  DESA_OVERVIEW = "desa_overview",
}
