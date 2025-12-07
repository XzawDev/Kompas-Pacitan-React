import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, currentUserId } = await request.json();

    if (!userId || !currentUserId) {
      return NextResponse.json(
        { error: "User ID dan Current User ID diperlukan" },
        { status: 400 }
      );
    }

    // Verifikasi bahwa current user adalah owner
    const currentUserDoc = await adminDb
      .collection("users")
      .doc(currentUserId)
      .get();
    const currentUserData = currentUserDoc.data();

    if (!currentUserData || currentUserData.role !== "owner") {
      return NextResponse.json(
        { error: "Hanya owner yang dapat menghapus user" },
        { status: 403 }
      );
    }

    // Cegah owner menghapus dirinya sendiri
    if (userId === currentUserId) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus akun sendiri" },
        { status: 400 }
      );
    }

    // Dapatkan data user yang akan dihapus
    const userToDeleteDoc = await adminDb.collection("users").doc(userId).get();
    const userToDeleteData = userToDeleteDoc.data();

    // Cegah menghapus owner lain (hanya boleh ada satu owner)
    if (userToDeleteData?.role === "owner") {
      return NextResponse.json(
        { error: "Tidak dapat menghapus user dengan role owner" },
        { status: 400 }
      );
    }

    console.log(`🔄 Menghapus user: ${userId}`);

    // Hapus user dari Firebase Authentication menggunakan Admin SDK
    await adminAuth.deleteUser(userId);

    // Hapus user data dari Firestore
    await adminDb.collection("users").doc(userId).delete();

    // Hapus dari usernames collection jika ada
    if (userToDeleteData?.username) {
      await adminDb
        .collection("usernames")
        .doc(userToDeleteData.username.toLowerCase())
        .delete();
    }

    // Hapus data terkait user (locations, investments, dll)
    await deleteUserRelatedData(userId);

    console.log(`✅ User ${userId} berhasil dihapus`);

    return NextResponse.json({
      success: true,
      message: "User berhasil dihapus secara permanen",
    });
  } catch (error: any) {
    console.error("❌ Error deleting user:", error);

    if (error.code === "auth/user-not-found") {
      return NextResponse.json(
        { error: "User tidak ditemukan di Authentication" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus user: " + error.message },
      { status: 500 }
    );
  }
}

// Fungsi untuk menghapus data terkait user
async function deleteUserRelatedData(userId: string) {
  try {
    // Hapus locations yang dibuat oleh user
    const locationsSnapshot = await adminDb
      .collection("locations")
      .where("createdBy", "==", userId)
      .get();

    const locationDeletes = locationsSnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(locationDeletes);

    // Hapus investments yang dibuat oleh user
    const investmentsSnapshot = await adminDb
      .collection("investments")
      .where("createdBy", "==", userId)
      .get();

    const investmentDeletes = investmentsSnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(investmentDeletes);

    // Hapus approvals yang terkait dengan user
    const approvalsSnapshot = await adminDb
      .collection("approvals")
      .where("submittedBy", "==", userId)
      .get();

    const approvalDeletes = approvalsSnapshot.docs.map((doc) =>
      doc.ref.delete()
    );
    await Promise.all(approvalDeletes);

    console.log(`✅ Data terkait user ${userId} berhasil dihapus`);
  } catch (error) {
    console.error("Error deleting user related data:", error);
    throw error;
  }
}
