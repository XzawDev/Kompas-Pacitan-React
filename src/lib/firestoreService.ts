import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Location,
  InvestmentOpportunity,
  Approval,
  User,
  AIRecommendation,
  BlobUploadResponse,
  Desa,
} from "./types";

// ==================== USER OPERATIONS ====================

export const createUserProfile = async (
  userId: string,
  userData: {
    email: string;
    username: string;
    role?: "user" | "admin";
  }
) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...userData,
      role: userData.role || "user",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { uid: userId, ...userDoc.data() } as User;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// ==================== LOCATION OPERATIONS ====================

export const addLocation = async (
  locationData: Omit<Location, "id" | "createdAt" | "updatedAt" | "status"> & {
    status?: "pending" | "approved";
  },
  isAdmin: boolean = false
) => {
  try {
    const finalStatus = isAdmin ? "approved" : "pending";

    const locationDoc = {
      ...locationData,
      status: finalStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isAdmin && {
        approvedBy: locationData.createdBy,
        approvedAt: serverTimestamp(),
      }),
    };

    const docRef = await addDoc(collection(db, "locations"), locationDoc);

    // Hanya buat approval entry jika BUKAN admin
    if (!isAdmin) {
      await addDoc(collection(db, "approvals"), {
        type: "location",
        targetId: docRef.id,
        targetData: locationData,
        submittedBy: locationData.createdBy,
        submittedAt: serverTimestamp(),
        status: "pending",
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error adding location:", error);
    throw error;
  }
};

export const getLocations = async (
  status?: "approved"
): Promise<Location[]> => {
  try {
    let q;
    if (status) {
      q = query(collection(db, "locations"), where("status", "==", status));
    } else {
      q = query(collection(db, "locations"));
    }

    const querySnapshot = await getDocs(q);
    const locations: Location[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as Location);
    });

    return locations;
  } catch (error) {
    console.error("Error getting locations:", error);
    throw error;
  }
};

export const getUserLocations = async (userId: string): Promise<Location[]> => {
  try {
    const q = query(
      collection(db, "locations"),
      where("createdBy", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const locations: Location[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        coords: data.coords || { lat: 0, lng: 0 },
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as Location);
    });

    // Sort manually by creation date
    locations.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return locations;
  } catch (error) {
    console.error("Error getting user locations:", error);
    throw error;
  }
};

export const updateLocationStatus = async (
  locationId: string,
  status: "approved" | "rejected",
  adminId: string,
  rejectionReason?: string
) => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "approved") {
      updateData.approvedBy = adminId;
      updateData.approvedAt = serverTimestamp();
      // Hapus rejectionReason jika status approved
      updateData.rejectionReason = null;
    } else if (status === "rejected") {
      // Hanya set rejectionReason jika ada dan status rejected
      if (rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
    }

    await updateDoc(doc(db, "locations", locationId), updateData);

    // Update corresponding approval
    const approvalsQuery = query(
      collection(db, "approvals"),
      where("targetId", "==", locationId),
      where("type", "==", "location")
    );

    const approvalsSnapshot = await getDocs(approvalsQuery);
    approvalsSnapshot.forEach(async (approvalDoc) => {
      const approvalUpdateData: any = {
        status,
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
      };

      // Hanya tambahkan notes jika ada rejectionReason
      if (rejectionReason) {
        approvalUpdateData.notes = rejectionReason;
      }

      await updateDoc(doc(db, "approvals", approvalDoc.id), approvalUpdateData);
    });
  } catch (error) {
    console.error("Error updating location status:", error);
    throw error;
  }
};

// ==================== APPROVAL OPERATIONS ====================

export const getPendingApprovals = async (): Promise<Approval[]> => {
  try {
    const q = query(
      collection(db, "approvals"),
      where("status", "==", "pending"),
      orderBy("submittedAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const approvals: Approval[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      approvals.push({
        id: doc.id,
        ...data,
        submittedAt: data.submittedAt?.toDate().toISOString(),
        reviewedAt: data.reviewedAt?.toDate().toISOString(),
      } as Approval);
    });

    return approvals;
  } catch (error) {
    console.error("Error getting pending approvals:", error);
    throw error;
  }
};

export const getApprovalStats = async () => {
  try {
    const [locationsQuery, investmentsQuery, approvalsQuery] =
      await Promise.all([
        getDocs(collection(db, "locations")),
        getDocs(collection(db, "investments")),
        getDocs(
          query(collection(db, "approvals"), where("status", "==", "pending"))
        ),
      ]);

    return {
      totalLocations: locationsQuery.size,
      totalInvestments: investmentsQuery.size,
      pendingApprovals: approvalsQuery.size,
    };
  } catch (error) {
    console.error("Error getting approval stats:", error);
    throw error;
  }
};

// ==================== PUBLIC DATA OPERATIONS ====================

export const getApprovedLocations = async (): Promise<Location[]> => {
  try {
    const q = query(
      collection(db, "locations"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const locations: Location[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      locations.push({
        id: doc.id,
        ...data,
        coords: data.coords || { lat: 0, lng: 0 },
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as Location);
    });

    return locations;
  } catch (error) {
    console.error("Error getting approved locations:", error);
    throw error;
  }
};

export const getApprovedInvestments = async (): Promise<
  InvestmentOpportunity[]
> => {
  try {
    const q = query(
      collection(db, "investments"),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const investments: InvestmentOpportunity[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      } as InvestmentOpportunity);
    });

    return investments;
  } catch (error) {
    console.error("Error getting approved investments:", error);
    throw error;
  }
};

export const getLocationById = async (
  locationId: string
): Promise<Location | null> => {
  try {
    const docRef = doc(db, "locations", locationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        coords: data.coords || { lat: 0, lng: 0 },
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as Location;
    }
    return null;
  } catch (error) {
    console.error("Error getting location by ID:", error);
    throw error;
  }
};

export const getInvestmentById = async (
  investmentId: string
): Promise<InvestmentOpportunity | null> => {
  try {
    const docRef = doc(db, "investments", investmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as InvestmentOpportunity;
    }
    return null;
  } catch (error) {
    console.error("Error getting investment by ID:", error);
    throw error;
  }
};

export const addInvestment = async (
  investmentData: Omit<
    InvestmentOpportunity,
    "id" | "createdAt" | "updatedAt" | "status"
  > & {
    status?: "pending" | "approved";
  },
  isAdmin: boolean = false
) => {
  try {
    const finalStatus = isAdmin ? "approved" : "pending";

    const investmentDoc = {
      ...investmentData,
      status: finalStatus,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...(isAdmin && {
        approvedBy: investmentData.createdBy,
        approvedAt: serverTimestamp(),
      }),
    };

    const docRef = await addDoc(collection(db, "investments"), investmentDoc);

    // Hanya buat approval entry jika BUKAN admin
    if (!isAdmin) {
      await addDoc(collection(db, "approvals"), {
        type: "investment",
        targetId: docRef.id,
        targetData: investmentData,
        submittedBy: investmentData.createdBy,
        submittedAt: serverTimestamp(),
        status: "pending",
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error adding investment:", error);
    throw error;
  }
};

export const updateInvestmentStatus = async (
  investmentId: string,
  status: "approved" | "rejected",
  adminId: string,
  rejectionReason?: string
) => {
  try {
    const updateData: any = {
      status,
      updatedAt: serverTimestamp(),
    };

    if (status === "approved") {
      updateData.approvedBy = adminId;
      updateData.approvedAt = serverTimestamp();
      updateData.rejectionReason = null;
    } else if (status === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    await updateDoc(doc(db, "investments", investmentId), updateData);

    // Update corresponding approval
    const approvalsQuery = query(
      collection(db, "approvals"),
      where("targetId", "==", investmentId),
      where("type", "==", "investment")
    );

    const approvalsSnapshot = await getDocs(approvalsQuery);
    approvalsSnapshot.forEach(async (approvalDoc) => {
      const approvalUpdateData: any = {
        status,
        reviewedBy: adminId,
        reviewedAt: serverTimestamp(),
      };

      if (rejectionReason) {
        approvalUpdateData.notes = rejectionReason;
      }

      await updateDoc(doc(db, "approvals", approvalDoc.id), approvalUpdateData);
    });
  } catch (error) {
    console.error("Error updating investment status:", error);
    throw error;
  }
};

export const getUserInvestments = async (
  userId: string
): Promise<InvestmentOpportunity[]> => {
  try {
    const q = query(
      collection(db, "investments"),
      where("createdBy", "==", userId)
    );

    const querySnapshot = await getDocs(q);
    const investments: InvestmentOpportunity[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      investments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
        approvedAt: data.approvedAt?.toDate().toISOString(),
      } as InvestmentOpportunity);
    });

    // Sort manually by creation date
    investments.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return investments;
  } catch (error) {
    console.error("Error getting user investments:", error);
    throw error;
  }
};

export const updateLocationAIRecommendation = async (
  locationId: string,
  aiRecommendation: AIRecommendation
) => {
  try {
    await updateDoc(doc(db, "locations", locationId), {
      aiRecommendation,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating AI recommendation:", error);
    throw error;
  }
};

// ==================== VERCEL BLOB STORAGE UPLOAD ====================

export const uploadToVercelBlob = async (file: File): Promise<string> => {
  try {
    // Buat FormData untuk upload
    const formData = new FormData();
    formData.append("file", file);

    // Panggil API route untuk upload ke Vercel Blob
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const data: BlobUploadResponse = await response.json();
    return data.url;
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    throw new Error("Gagal mengupload gambar ke Vercel Blob Storage");
  }
};

// Tambahkan fungsi untuk mengambil data desa
export const getDesa = async (): Promise<Desa[]> => {
  try {
    const q = query(collection(db, "desa"), orderBy("nama"));
    const querySnapshot = await getDocs(q);
    const desaList: Desa[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      desaList.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      } as Desa);
    });

    return desaList;
  } catch (error) {
    console.error("Error getting desa:", error);
    throw error;
  }
};

export const getDesaById = async (id: string): Promise<Desa | null> => {
  try {
    const docRef = doc(db, "desa", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate().toISOString(),
        updatedAt: data.updatedAt?.toDate().toISOString(),
      } as Desa;
    }
    return null;
  } catch (error) {
    console.error("Error getting desa by ID:", error);
    throw error;
  }
};

// Tambahkan fungsi ini di firestoreService.ts

export const addDesa = async (
  desaData: Omit<Desa, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const docRef = await addDoc(collection(db, "desa"), {
      ...desaData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding desa:", error);
    throw error;
  }
};

export const updateDesa = async (desaId: string, desaData: Partial<Desa>) => {
  try {
    await updateDoc(doc(db, "desa", desaId), {
      ...desaData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating desa:", error);
    throw error;
  }
};

export const deleteDesa = async (desaId: string) => {
  try {
    await deleteDoc(doc(db, "desa", desaId));
  } catch (error) {
    console.error("Error deleting desa:", error);
    throw error;
  }
};
