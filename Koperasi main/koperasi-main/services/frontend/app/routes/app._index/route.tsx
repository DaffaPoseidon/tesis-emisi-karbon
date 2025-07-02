import PageContainer from "~/components/page-container";
import { useJWTPayload } from "~/hooks/use-jwt-payload";
import { useGetUserById } from "~/services/profile/get-by-id";
import BasicDashboard from "./components/dashboard/basic-dashboard";
import PlatinumDashboard from "./components/dashboard/platinum-dashboard";

export default function AppDashboardPage() {
  const { jwtPayload } = useJWTPayload();
  const { data } = useGetUserById(jwtPayload.id);
  return (
    <PageContainer>
      {jwtPayload.role === "PLATINUM" ? (
        <PlatinumDashboard />
      ) : (
        data && <BasicDashboard data={data} />
      )}
    </PageContainer>
  );
}
