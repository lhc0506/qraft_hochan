import { Disclosure } from '@/types/common';
import DisclosureContainer from '@/components/disclosure/DisclosureContainer';

// ISR 설정: 1시간마다 페이지 재생성
export const revalidate = 3600;

// 초기 데이터를 서버에서 가져오는 함수
async function getInitialDisclosures() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/disclosures?page=1`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch initial disclosures');
    }

    return (await response.json()) as {
      disclosures: Disclosure[];
      hasMore: boolean;
      total: number;
    };
  } catch (error) {
    console.error('Error fetching initial disclosures:', error);
    return { disclosures: [], hasMore: false, total: 0 };
  }
}

export default async function Home() {
  // 서버에서 초기 데이터 가져오기
  const initialData = await getInitialDisclosures();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-900">해외공시 AI 번역 솔루션</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <DisclosureContainer initialData={initialData} />
      </main>
    </div>
  );
}
