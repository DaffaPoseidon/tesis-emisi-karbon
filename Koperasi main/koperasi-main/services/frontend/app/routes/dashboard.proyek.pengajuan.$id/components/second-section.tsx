import { Check, Clock, Lock, X } from "lucide-react";
import type { StatusData } from "~/types/constants/status-data";

type StatusType = "SUCCESS" | "FAILED" | "CURRENT" | "UPCOMING" | "PENDING";

export default function SecondSection({
  data,
  handleClick,
}: { data: StatusData[]; handleClick: () => void }) {
  const steps = [
    "Proposal Project Terkirim",
    "Peninjauan Proposal",
    "Proses Approval dari Komitee Koperasi",
    "Kontrak Perjanjian",
    "Proses Penggalangan Penyertaan Modal",
  ];

  const getLatestStatusForStep = (step: string) => {
    const matchingStatuses = data.filter((status) => status.history === step);
    return matchingStatuses.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  };

  const getStepStatus = (index: number): StatusType => {
    const step = steps[index];
    const latestStatus = getLatestStatusForStep(step);
    if (latestStatus) return latestStatus.status as unknown as StatusType;

    const lastCompletedIndex = steps.findIndex((step) => !getLatestStatusForStep(step));
    if (index === lastCompletedIndex) return "CURRENT";
    return "UPCOMING";
  };

  const getStatusColor = (status: StatusType) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500 text-green-500";
      case "FAILED":
        return "bg-red-500 text-red-500";
      case "CURRENT":
        return "bg-blue-500 text-blue-500";
      case "PENDING":
        return "bg-yellow-400 text-yellow-500";
      default:
        return "bg-gray-300 text-gray-500";
    }
  };

  return (
    <section className="order-2 min-w-96 flex-1 space-y-6 rounded-md bg-white p-6 xl:order-1">
      <h4 className="font-semibold text-lg">Progres Status Pengajuan Project</h4>
      <div className="space-y-10">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const stepData = getLatestStatusForStep(step);
          const statusColor = getStatusColor(status);

          return (
            <div key={index} className={`relative ${index < steps.length - 1 ? "h-32" : "h-fit"}`}>
              <div className="flex items-start">
                <div className="mr-4 flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      // biome-ignore lint/nursery/useSortedClasses: <explanation>
                      statusColor.split(" ")[0]
                    }`}
                  >
                    {status === "SUCCESS" && <Check className="text-white" size={16} />}
                    {status === "FAILED" && <X className="text-white" size={16} />}
                    {status === "CURRENT" && (
                      <span className="font-bold text-white">{index + 1}</span>
                    )}
                    {status === "PENDING" && <Clock className="text-white" size={16} />}
                    {status === "UPCOMING" && <Lock className="text-white" size={16} />}
                  </div>
                </div>
                <div className="flex-1">
                  <h3
                    className={`font-semibold ${
                      // biome-ignore lint/nursery/useSortedClasses: <explanation>
                      statusColor.split(" ")[1]
                    }`}
                  >
                    {step}
                  </h3>
                  {stepData && (
                    <>
                      <p className="text-gray-500 text-sm">
                        {new Date(stepData.created_at).toLocaleString()}
                      </p>
                      <div
                        className={`mt-2 rounded p-3 text-sm ${
                          status === "SUCCESS"
                            ? "bg-green-100 text-green-700"
                            : status === "FAILED"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
                        dangerouslySetInnerHTML={{ __html: stepData.keterangan }}
                      />
                    </>
                  )}
                  {status === "CURRENT" && (
                    <button
                      onClick={handleClick}
                      type="button"
                      className="mt-2 rounded border border-blue-500 bg-white px-4 py-2 text-blue-500 transition-colors hover:bg-blue-50"
                    >
                      Tinjau Proposal
                    </button>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-8 bottom-0 left-4 h-full w-0 border-gray-300 border-l-2 border-dashed" />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
