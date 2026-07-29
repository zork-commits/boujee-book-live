import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, login, logout, signup } from "@/fn/auth";
import { listPros, getPro, getCategoryCounts } from "@/fn/pros";
import { createBooking, myBookings, cancelBooking, submitReview, proBookings, setBookingStatus } from "@/fn/bookings";
import { myConversations, getMessages, sendMessage } from "@/fn/messages";
import { myFavorites, toggleFavorite } from "@/fn/favorites";
import { proDashboard } from "@/fn/pro-dashboard";
import { becomePro, updateProProfile, addService, deleteService, getMyHours, updateHours } from "@/fn/pro-profile";
import { bookableSlots } from "@/fn/bookings";
import { myNotifications, unreadCount, markAllRead } from "@/fn/notifications";
import { submitDispute, myDisputes } from "@/fn/disputes";
import { reportContent, blockUser } from "@/fn/moderation";
import { exportMyData, deleteMyAccount, updateMyName, signOutEverywhere } from "@/fn/account";
import { requestPasswordReset, resetPassword } from "@/fn/auth";
import { shareLocation, stopSharing, getLiveTracking } from "@/fn/tracking";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: () => getMe(), staleTime: 60_000 });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string }) => login({ data }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useSignup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; password: string; name: string }) => signup({ data }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => logout(), onSuccess: () => qc.clear() });
}

export function usePros(filters?: { q?: string; category?: string; sort?: "rating" | "price" | "distance" }) {
  return useQuery({
    queryKey: ["pros", filters ?? {}],
    queryFn: () => listPros({ data: filters }),
    staleTime: 30_000,
  });
}

export function usePro(id: string) {
  return useQuery({ queryKey: ["pro", id], queryFn: () => getPro({ data: { id } }) });
}

export function useCategoryCounts() {
  return useQuery({ queryKey: ["categoryCounts"], queryFn: () => getCategoryCounts(), staleTime: 300_000 });
}

export function useMyBookings() {
  return useQuery({ queryKey: ["bookings"], queryFn: () => myBookings() });
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createBooking>[0]["data"]) => createBooking({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelBooking({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; rating: number; comment?: string }) => submitReview({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

export function useConversations() {
  return useQuery({ queryKey: ["conversations"], queryFn: () => myConversations() });
}

export function useThread(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getMessages({ data: { conversationId: conversationId! } }),
    enabled: conversationId != null,
    refetchInterval: 5_000, // light polling until websockets land
    refetchIntervalInBackground: true,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { body: string; conversationId?: string; proId?: string }) => sendMessage({ data }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      if (res.ok) qc.invalidateQueries({ queryKey: ["messages", res.message.conversationId] });
    },
  });
}

export function useFavorites() {
  return useQuery({ queryKey: ["favorites"], queryFn: () => myFavorites() });
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (proId: string) => toggleFavorite({ data: { proId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites"] }),
  });
}

export function useProDashboard() {
  return useQuery({ queryKey: ["proDashboard"], queryFn: () => proDashboard() });
}

export function useProBookings(range?: { from: string; to: string }) {
  return useQuery({
    queryKey: ["proBookings", range ?? {}],
    queryFn: () => proBookings({ data: range }),
  });
}

export function useSetBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; status: "confirmed" | "en_route" | "arrived" | "completed" | "cancelled" }) => setBookingStatus({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proDashboard"] });
      qc.invalidateQueries({ queryKey: ["proBookings"] });
      qc.invalidateQueries({ queryKey: ["liveTracking"] });
    },
  });
}

export function useBecomePro() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof becomePro>[0]["data"]) => becomePro({ data }),
    onSuccess: () => qc.invalidateQueries(),
  });
}

export function useUpdateProProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof updateProProfile>[0]["data"]) => updateProProfile({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proDashboard"] });
      qc.invalidateQueries({ queryKey: ["pro"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

export function useAddService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; price: number; mins: number }) => addService({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteService({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pro"] });
      qc.invalidateQueries({ queryKey: ["pros"] });
    },
  });
}

export function useBookableSlots(args: { proId: string; serviceId: string; date: string } | null) {
  return useQuery({
    queryKey: ["slots", args],
    queryFn: () => bookableSlots({ data: args! }),
    enabled: args != null && !!args.serviceId && !!args.date,
  });
}

export function useMyHours() {
  return useQuery({ queryKey: ["myHours"], queryFn: () => getMyHours() });
}

export function useUpdateHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { dow: number; enabled: boolean; startMin: number; endMin: number }) => updateHours({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myHours"] });
      qc.invalidateQueries({ queryKey: ["slots"] });
    },
  });
}

export function useNotifications() {
  return useQuery({ queryKey: ["notifications"], queryFn: () => myNotifications() });
}

export function useUnreadCount() {
  return useQuery({ queryKey: ["unreadCount"], queryFn: () => unreadCount(), refetchInterval: 30_000 });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });
}

export function useSubmitDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; reason: string; details: string }) => submitDispute({ data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["disputes"] }),
  });
}

export function useMyDisputes() {
  return useQuery({ queryKey: ["disputes"], queryFn: () => myDisputes() });
}

export function useReportContent() {
  return useMutation({
    mutationFn: (data: { targetType: "pro" | "user" | "review" | "message" | "conversation"; targetId: string; reason: string; details?: string }) =>
      reportContent({ data }),
  });
}

export function useBlockUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => blockUser({ data: { userId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

export function useExportMyData() {
  return useMutation({ mutationFn: () => exportMyData() });
}

export function useDeleteMyAccount() {
  return useMutation({ mutationFn: (password: string) => deleteMyAccount({ data: { password } }) });
}

export function useUpdateMyName() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => updateMyName({ data: { name } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
  });
}

export function useSignOutEverywhere() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => signOutEverywhere(), onSuccess: () => qc.clear() });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => requestPasswordReset({ data: { email } }) });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (data: { token: string; password: string }) => resetPassword({ data }) });
}

export function useLiveTracking(bookingId: string | null) {
  return useQuery({
    queryKey: ["liveTracking", bookingId],
    queryFn: () => getLiveTracking({ data: { bookingId: bookingId! } }),
    enabled: bookingId != null,
    refetchInterval: 4_000, // DoorDash-style live polling
    refetchIntervalInBackground: true, // keep the map moving even when the tab loses focus
  });
}

export function useShareLocation() {
  return useMutation({
    mutationFn: (data: { bookingId: string; lat: number; lng: number; accuracy?: number; heading?: number }) =>
      shareLocation({ data }),
  });
}

export function useStopSharing() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => stopSharing({ data: { bookingId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liveTracking"] }),
  });
}

/** "Today · 4:30 PM", "Fri · 11:00 AM", or "Jun 12" for older dates. */
export function fmtWhen(isoDate: string): string {
  const d = new Date(isoDate);
  const now = new Date();
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(d, now)) return `Today · ${time}`;
  if (sameDay(d, tomorrow)) return `Tomorrow · ${time}`;
  const diffDays = Math.abs(d.getTime() - now.getTime()) / 86400_000;
  if (d > now && diffDays < 7) return `${d.toLocaleDateString("en-US", { weekday: "short" })} · ${time}`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function initials(name: string): string {
  return name.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}
