import AdminLoginArea from "@/components/admin-login/admin-login-area";
import GymIntroSection from "@/components/home/gym-intro-section";

export default function Home() {
  return (
    <div style={{ fontFamily: "'Vazir', sans-serif" }}>
      <GymIntroSection />
      <AdminLoginArea />
    </div>
  );
}
