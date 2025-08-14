"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Users,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  UserPlus,
  Eye,
  FileText,
  Target,
  CalendarDays,
  Globe,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Banknote,
} from "lucide-react";
import { EventCard } from "@/components/event-card";
import { RecruitmentCard } from "@/components/recruitment-card";
import { ClubHeader } from "@/components/club-header";
import { ActivitiesTab } from "@/components/activities-tab";
import { ApplicationForm } from "@/components/application-form";
import { useAuthStore } from "@/stores/auth-store";
import { useToast } from "@/hooks/use-toast";
import {
  clubService,
  ClubDetail,
  Event as ApiEvent,
  Recruitment as ApiRecruitment,
} from "@/services/club.service";
import { campaignService } from "@/services/campaign.service";

// Data validation utilities
const validateRecruitmentData = (recruitment: ApiRecruitment): boolean => {
  return !!(
    recruitment.id &&
    recruitment.title &&
    recruitment.start_date &&
    recruitment.end_date
  );
};

// Chỉ cần id, title, start_date, location là đủ cho event
const validateEventData = (event: any): boolean => {
  return !!(
    event &&
    event.id &&
    event.title &&
    event.start_date &&
    event.location
  );
};

// Transform API event to component event
const transformEventForCard = (apiEvent: ApiEvent): any => {
  // Normalize location based on event type
  const loc = apiEvent.location;
  let locationText = "TBA";
  
  if (typeof loc === "string" && (loc as string).trim().length > 0) {
    locationText = loc as string;
  } else if (loc && typeof loc === "object") {
    const locationType = (loc as any).location_type || (loc as any).type;
    if (locationType === "virtual" || locationType === "online") {
      // Online event - chỉ hiển thị platform
      locationText = (loc as any).platform || "Online";
    } else if (locationType === "physical" || locationType === "offline") {
      // Offline event - chỉ hiển thị address
      locationText = (loc as any).address || "TBA";
    } else {
      // Fallback cho các loại location khác
      const parts = [(loc as any).address, (loc as any).room].filter(Boolean);
      if (parts.length > 0) {
        locationText = parts.join(" - ");
      }
    }
  }

  // Normalize fee and currency
  const fee = apiEvent.participation_fee || apiEvent.fee || 0;
  const currency = apiEvent.currency || "VND";
  
  // Format fee display
  let feeDisplay = "";
  if (fee === 0) {
    feeDisplay = "Miễn phí";
  } else {
    switch (currency.toUpperCase()) {
      case "USD":
        feeDisplay = `$${fee.toLocaleString()}`;
        break;
      case "EUR":
        feeDisplay = `€${fee.toLocaleString()}`;
        break;
      case "JPY":
        feeDisplay = `¥${fee.toLocaleString()}`;
        break;
      case "KRW":
        feeDisplay = `₩${fee.toLocaleString()}`;
        break;
      case "CNY":
        feeDisplay = `¥${fee.toLocaleString()}`;
        break;
      case "VND":
      default:
        feeDisplay = `${fee.toLocaleString("vi-VN")} VNĐ`;
        break;
    }
  }

  return {
    event_id: apiEvent.id,
    title: apiEvent.title,
    date: apiEvent.start_date || apiEvent.date || new Date().toISOString(),
    time: apiEvent.start_date
      ? new Date(apiEvent.start_date).toTimeString().slice(0, 5)
      : "00:00",
    location: locationText,
    club: "Club Event",
    fee: fee,
    fee_display: feeDisplay,
    currency: currency,
    description: apiEvent.short_description || apiEvent.description || "",
  };
};

// Transform API recruitment to component recruitment
const transformRecruitmentForCard = (apiRecruitment: ApiRecruitment): any => {
  console.log("🔄 transformRecruitmentForCard called with:", apiRecruitment);

  // Properly map status from API to component expected values
  const mapStatus = (
    apiStatus: string
  ): "draft" | "published" | "paused" | "completed" => {
    switch (apiStatus.toLowerCase()) {
      case "active":
      case "published":
        return "published";
      case "paused":
      case "suspended":
        return "paused";
      case "completed":
      case "closed":
        return "completed";
      case "draft":
      default:
        return "draft";
    }
  };

  // Transform application questions - handle both string array and object array
  const transformApplicationQuestions = (questions?: string[] | any[]) => {
    console.log("🔍 Original application_questions:", questions);
    console.log(
      "🔍 Type of application_questions:",
      typeof questions,
      Array.isArray(questions)
    );

    if (!questions || !Array.isArray(questions)) {
      console.log("❌ No questions or not an array");
      return [];
    }

    // If questions are already objects (from API), use them directly
    if (
      questions.length > 0 &&
      typeof questions[0] === "object" &&
      questions[0].id
    ) {
      console.log("✅ Questions are objects, using directly:", questions);
      return questions.map((q) => ({
        id: q.id,
        question: q.question,
        type: q.type || "textarea",
        required: q.required !== undefined ? q.required : true,
        max_length: q.max_length || 500,
        options: q.options || [],
      }));
    }

    // If questions are strings, transform them
    if (typeof questions[0] === "string") {
      console.log("🔄 Questions are strings, transforming:", questions);
      return questions.map((question, index) => ({
        id: `q_${index}`,
        question: question,
        type: "textarea" as const,
        required: true,
        max_length: 500,
        options: [],
      }));
    }

    console.log("❌ Unknown question format");
    return [];
  };

  return {
    id: apiRecruitment.id,
    club_id: apiRecruitment.club_id,
    club_name: apiRecruitment.club_name,
    title: apiRecruitment.title,
    description: apiRecruitment.description,
    requirements: apiRecruitment.requirements || [],
    application_questions: transformApplicationQuestions(
      apiRecruitment.application_questions
    ),
    start_date: apiRecruitment.start_date,
    end_date: apiRecruitment.end_date,
    max_applications: apiRecruitment.max_applications,
    status: mapStatus(apiRecruitment.status),
    statistics: {
      total_applications:
        apiRecruitment.statistics?.total_applications ||
        apiRecruitment.applications_count ||
        0,
      approved_applications:
        apiRecruitment.statistics?.approved_applications || 0,
      rejected_applications:
        apiRecruitment.statistics?.rejected_applications || 0,
      pending_applications:
        apiRecruitment.statistics?.pending_applications || 0,
      last_updated:
        apiRecruitment.statistics?.last_updated ||
        apiRecruitment.updated_at ||
        new Date().toISOString(),
    },
    created_by: apiRecruitment.created_at ? undefined : undefined, // Preserve original created_by if available
    created_at: apiRecruitment.created_at,
    updated_at: apiRecruitment.updated_at || apiRecruitment.created_at,
    published_at:
      mapStatus(apiRecruitment.status) === "published"
        ? apiRecruitment.updated_at
        : undefined,
  };

  // Log the final transformed data
  const transformedData = {
    id: apiRecruitment.id,
    club_id: apiRecruitment.club_id,
    club_name: apiRecruitment.club_name,
    title: apiRecruitment.title,
    description: apiRecruitment.description,
    requirements: apiRecruitment.requirements || [],
    application_questions: transformApplicationQuestions(
      apiRecruitment.application_questions
    ),
    start_date: apiRecruitment.start_date,
    end_date: apiRecruitment.end_date,
    max_applications: apiRecruitment.max_applications,
    status: mapStatus(apiRecruitment.status),
    statistics: {
      total_applications:
        apiRecruitment.statistics?.total_applications ||
        apiRecruitment.applications_count ||
        0,
      approved_applications:
        apiRecruitment.statistics?.approved_applications || 0,
      rejected_applications:
        apiRecruitment.statistics?.rejected_applications || 0,
      pending_applications:
        apiRecruitment.statistics?.pending_applications || 0,
      last_updated:
        apiRecruitment.statistics?.last_updated ||
        apiRecruitment.updated_at ||
        new Date().toISOString(),
    },
    created_by: apiRecruitment.created_at ? undefined : undefined, // Preserve original created_by if available
    created_at: apiRecruitment.created_at,
    updated_at: apiRecruitment.updated_at || apiRecruitment.created_at,
    published_at:
      mapStatus(apiRecruitment.status) === "published"
        ? apiRecruitment.updated_at
        : undefined,
  };

  console.log("🎯 Final transformed recruitment data:", {
    id: transformedData.id,
    title: transformedData.title,
    application_questions_count:
      transformedData.application_questions?.length || 0,
    application_questions: transformedData.application_questions,
  });

  return transformedData;
};

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const clubId = params.club_id as string;
  const campaignIdFromQuery = searchParams.get("campaign_id");
  const applyFromQuery = searchParams.get("apply") === "true";

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null); // Track selected campaign for application
  const [relatedClubs, setRelatedClubs] = useState<any[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);

  useEffect(() => {
    fetchClubData();
  }, [clubId]);

  // Fetch related clubs when club data is loaded
  useEffect(() => {
    if (club && club.category) {
      fetchRelatedClubs();
    }
  }, [club]);

  useEffect(() => {
    // Nếu có campaign_id và apply=true trên URL, fetch campaign detail và show form
    if (campaignIdFromQuery && applyFromQuery) {
      (async () => {
        try {
          const response = await campaignService.getCampaignDetail(campaignIdFromQuery);
          if (response.success && response.data) {
            setSelectedCampaign(response.data);
          } else {
            setSelectedCampaign(null);
          }
        } catch (e) {
          setSelectedCampaign(null);
        }
      })();
    } else {
      setSelectedCampaign(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignIdFromQuery, applyFromQuery]);

  const fetchClubData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clubService.getClubDetail(clubId);
      if (response.success && response.data) {
        // Validate and sanitize the received data
        const clubData = response.data;

        // Ensure required fields exist with fallbacks
        const sanitizedClub: ClubDetail = {
          ...clubData,
          // Ensure arrays are properly initialized
          current_recruitments: Array.isArray(clubData.current_recruitments)
            ? clubData.current_recruitments
            : [],
          published_events: Array.isArray(clubData.published_events)
            ? clubData.published_events
            : [],
          // Ensure numeric values
          member_count: clubData.member_count || clubData.size || 0,
          total_events: clubData.total_events || 0,
          total_recruitments: clubData.total_recruitments || 0,
          active_recruitments: clubData.active_recruitments || 0,
          // Ensure settings object exists
          settings: clubData.settings || {
            is_public: true,
            requires_approval: false,
            max_members: undefined,
          },
        };

        setClub(sanitizedClub);

      } else {
        setError(response.message || "Failed to fetch club data");
      }
    } catch (error) {
      console.error("Error fetching club data:", error);
      setError("Failed to fetch club data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedClubs = async () => {
    if (!club?.category) return;

    setIsLoadingRelated(true);
    try {
      const response = await clubService.getClubs({
        category: club.category,
        limit: 5,
        page: 1,
      });

      if (response.success && response.data) {
        // Filter out the current club from related clubs
        const filtered = response.data.results.filter((c) => c.id !== club.id);
        setRelatedClubs(filtered);
      }
    } catch (error) {
      console.error("Error fetching related clubs:", error);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleJoinClub = async () => {
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tham gia câu lạc bộ.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setIsJoining(true);

    try {
      await clubService.joinClub(clubId);
      toast({
        title: "Tham gia thành công!",
        description: `Chào mừng bạn đến với ${club?.name || "câu lạc bộ"}! Bạn sẽ nhận được thông báo về các sự kiện và hoạt động sắp tới.`,
      });
      // Refetch club data to update member status
      fetchClubData();
    } catch (error) {
      console.error("Error joining club:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tham gia câu lạc bộ. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleApplyRecruitment = async (recruitmentId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to apply for recruitment.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    toast({
      title: "Application submitted!",
      description:
        "Your application has been submitted successfully. You'll hear back from us soon.",
    });
  };

  const handleCloseApplication = () => {
    setSelectedCampaign(null);
    router.replace(`/clubs/${clubId}`);
  };

  const handleApplyToCampaign = async (campaign: any) => {
    console.log("🚀 handleApplyToCampaign called with campaign:", campaign);
    console.log("🔍 Campaign application_questions:", {
      count: campaign.application_questions?.length || 0,
      questions: campaign.application_questions,
    });

    // Check authentication first
    if (!user) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để ứng tuyển.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    // Validate campaign data before proceeding
    if (!campaign || !campaign.id || !campaign.title) {
      console.error("❌ Invalid campaign data:", campaign);
      toast({
        title: "Lỗi dữ liệu",
        description:
          "Thông tin chiến dịch tuyển dụng không hợp lệ. Vui lòng thử lại.",
        variant: "destructive",
      });
      return;
    }

    // Check if campaign is still active and not expired
    const now = new Date();
    const endDate = new Date(campaign.end_date);

    if (endDate < now) {
      toast({
        title: "Chiến dịch đã kết thúc",
        description:
          "Chiến dịch tuyển dụng này đã kết thúc. Vui lòng tìm cơ hội khác.",
        variant: "destructive",
      });
      return;
    }

    if (campaign.status !== "published") {
      toast({
        title: "Chiến dịch không khả dụng",
        description: "Chiến dịch tuyển dụng này hiện không mở cho ứng tuyển.",
        variant: "destructive",
      });
      return;
    }

    // Check if max applications reached
    if (
      campaign.max_applications &&
      campaign.statistics?.total_applications >= campaign.max_applications
    ) {
      toast({
        title: "Đã đạt giới hạn ứng tuyển",
        description: "Chiến dịch này đã nhận đủ số lượng ứng tuyển.",
        variant: "destructive",
      });
      return;
    }

    console.log(
      "✅ Campaign validation passed, fetching full campaign details..."
    );

    try {
      // Fetch full campaign details to get application_questions
      const response = await campaignService.getCampaignDetail(campaign.id);

      if (response.success && response.data) {
        const fullCampaign = response.data;
        console.log("🎯 Full campaign details fetched:", fullCampaign);
        console.log("🎯 Full campaign application_questions:", {
          count: fullCampaign.application_questions?.length || 0,
          questions: fullCampaign.application_questions,
        });

        setSelectedCampaign(fullCampaign);
        router.push(`/clubs/${clubId}?apply=true`);
      } else {
        console.error("❌ Failed to fetch campaign details:", response.message);
        toast({
          title: "Lỗi tải dữ liệu",
          description: "Không thể tải chi tiết chiến dịch. Vui lòng thử lại.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching campaign details:", error);
      toast({
        title: "Lỗi",
        description:
          "Có lỗi xảy ra khi tải thông tin chiến dịch. Vui lòng thử lại.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-8 w-64"></div>
            <div className="h-64 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? "Lỗi tải dữ liệu" : "Không tìm thấy câu lạc bộ"}
          </h1>
          <p className="text-gray-600 mb-8">
            {error || "Câu lạc bộ bạn đang tìm không tồn tại hoặc đã bị xóa."}
          </p>
          <Button asChild>
            <Link href="/clubs">Quay lại danh sách câu lạc bộ</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Club Header with Cover Image */}
      <ClubHeader club={club} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/clubs">Câu lạc bộ</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{club.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Club Info */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{club.category}</Badge>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {club.member_count || club.size || 0} thành viên
                      </div>
                    </div>
                    <CardTitle className="text-3xl">{club.name}</CardTitle>
                  </div>
                  {/* <div className="flex gap-2">
                    <Button onClick={handleJoinClub} disabled={isJoining} className="bg-blue-600 hover:bg-blue-700">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isJoining ? "Đang tham gia..." : "Tham gia câu lạc bộ"}
                    </Button>
                  </div> */}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {club.description}
                </p>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {club.manager?.assigned_at && (
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Quản lý từ:</span>
                      <span>
                        {new Date(club.manager.assigned_at).getFullYear()}
                      </span>
                    </div>
                  )}
                  {club.status && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Trạng thái:</span>
                      <span>{club.status}</span>
                    </div>
                  )}
                  {club.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Địa điểm:</span>
                      <span>{club.location}</span>
                    </div>
                  )}
                  {club.contact_email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Email:</span>
                      <span>{club.contact_email}</span>
                    </div>
                  )}
                  {club.contact_phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Điện thoại:</span>
                      <span>{club.contact_phone}</span>
                    </div>
                  )}
                  {club.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium mr-2">Website:</span>
                      <a
                        href={club.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {club.website_url}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                {club.social_links &&
                  Object.keys(club.social_links).length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="flex gap-3">
                        <span className="font-medium text-sm">
                          Mạng xã hội:
                        </span>
                        <div className="flex gap-2">
                          {club.social_links.facebook && (
                            <a
                              href={club.social_links.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Facebook className="h-4 w-4" />
                            </a>
                          )}
                          {club.social_links.instagram && (
                            <a
                              href={club.social_links.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-600 hover:text-pink-800"
                            >
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    </>
                  )}
              </CardContent>
            </Card>

            {/* Events Section */}
            <Card>
              <CardHeader>
                <CardTitle>Sự kiện đang diễn ra</CardTitle>
              </CardHeader>
              <CardContent>
                {club.published_events && club.published_events.length > 0 ? (
                  <div className="space-y-4">
                    {
                      (club.published_events as any[])
                        .filter(validateEventData)
                        .map((event: any) => {
                          try {
                            return (
                              <EventCard
                                key={event.id}
                                event={transformEventForCard(event)}
                              />
                            );
                          } catch (error) {
                            console.error(
                              "Error transforming event data:",
                              error,
                              event
                            );
                            return null;
                          }
                        })
                        .filter(Boolean)
                    }
                    {/* Show message if no valid events after filtering */}
                    {/* Đoạn này bỏ kiểm tra club.upcoming_events vì không tồn tại */}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có sự kiện nào được lên lịch</p>
                    <p className="text-sm">
                      Hãy quay lại sau để xem sự kiện mới!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recruitment Campaigns */}
            {club.current_recruitments &&
              club.current_recruitments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      Tuyển thành viên
                    </CardTitle>
                    <CardDescription>
                      Tham gia đội ngũ của chúng tôi! Xem các cơ hội tuyển dụng
                      đang mở
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {
                        (club.current_recruitments as any[])
                          .filter(validateRecruitmentData)
                          .map((recruitment: any) => {
                            try {
                              const transformedCampaign =
                                transformRecruitmentForCard(recruitment);
                              return (
                                <RecruitmentCard
                                  key={recruitment.id}
                                  campaign={transformedCampaign}
                                  onApply={(campaign) =>
                                    handleApplyToCampaign(campaign)
                                  }
                                />
                              );
                            } catch (error) {
                              console.error(
                                "Error transforming recruitment data:",
                                error,
                                recruitment
                              );
                              return null;
                            }
                          })
                          .filter(Boolean)
                      }
                      {/* Show message if no valid recruitments after filtering */}
                      {((club.current_recruitments as any[]).filter(validateRecruitmentData).length === 0) && (
                        <div className="text-center py-8 text-gray-500">
                          <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Hiện tại chưa có chiến dịch tuyển dụng nào</p>
                          <p className="text-sm">
                            Hãy quay lại sau để xem cơ hội mới!
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Thống kê câu lạc bộ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng thành viên</span>
                  <span className="font-semibold">
                    {club.member_count || club.size || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sự kiện đang diễn ra</span>
                  <span className="font-semibold">
                    {club.published_events?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tổng sự kiện</span>
                  <span className="font-semibold">
                    {club.total_events || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related Clubs */}
            <Card>
              <CardHeader>
                <CardTitle>Câu lạc bộ tương tự</CardTitle>
                <CardDescription>Bạn có thể quan tâm</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRelated ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse"
                      >
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                        </div>
                        <div className="h-8 w-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : relatedClubs.length > 0 ? (
                  <div className="space-y-3">
                    {relatedClubs.map((relatedClub) => (
                      <div
                        key={relatedClub.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {relatedClub.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {relatedClub.member_count || relatedClub.size || 0}{" "}
                            thành viên
                          </p>
                        </div>
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/clubs/${relatedClub.id}`}>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p className="text-sm">Không có câu lạc bộ tương tự</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      {applyFromQuery && selectedCampaign && (
        <>
          {console.log(
            "🎯 Rendering ApplicationForm with selectedCampaign:",
            selectedCampaign
          )}
          {console.log(
            "🎯 selectedCampaign.application_questions:",
            selectedCampaign.application_questions
          )}
          <ApplicationForm
            campaign={selectedCampaign}
            onClose={handleCloseApplication}
            onSuccess={() => {
              setSelectedCampaign(null);
              router.replace(`/clubs/${clubId}`);
            }}
          />
        </>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs max-w-sm">
          <div>
            selectedCampaign: {selectedCampaign ? selectedCampaign.id : "null"}
          </div>
          <div>
            questions count:{" "}
            {selectedCampaign?.application_questions?.length || 0}
          </div>
        </div>
      )}
    </div>
  );
}
