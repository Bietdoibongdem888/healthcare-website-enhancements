import { Card } from "./ui/card";
import { useAuth } from "../context/AuthContext";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

export function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user } = useAuth();
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Người dùng";

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="mb-2">Hồ sơ của tôi</h2>
          <p className="text-muted-foreground">Thông tin tài khoản và các bước tiếp theo</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <h5 className="mb-4">Thông tin tài khoản</h5>
            <div className="space-y-2 text-sm">
              <div>
                Họ tên: <b>{fullName}</b>
              </div>
              <div>
                Email: <b>{user?.email || "-"}</b>
              </div>
              <div>
                Số điện thoại: <b>{user?.phone || "-"}</b>
              </div>
              <div>
                Vai trò: <b>{user?.role || "user"}</b>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <h5 className="mb-4">Lịch hẹn gần đây</h5>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded border">
                Chưa có lịch hẹn được đồng bộ.
                <button className="ml-1 text-blue-500 hover:underline" onClick={() => onNavigate("booking")}>
                  Đặt lịch ngay
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
