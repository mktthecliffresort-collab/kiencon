import { Subject, Lesson, AntAlly, UserProfile, DailyQuest } from '../types';
import { GRADE_5_SGK_LESSONS } from './grade5SgkLessons';

export const ALLIES: Record<string, AntAlly> = {
  kien: {
    id: 'kien',
    name: 'Kiến Con',
    role: 'Thủ lĩnh Dẫn đường & Cố vấn Học tập',
    domain: 'Tư duy tổng hợp & Phương pháp Socratic',
    quote: 'Mỗi hạt cát nhỏ góp nên tổ kiến vĩ đại, mỗi câu hỏi hay mở ra một chân trời tri thức!',
    avatarColor: 'bg-amber-500',
    accentColor: 'text-amber-600',
    icon: '🐜',
    description: 'Người bạn đồng hành nhiệt tình và thấu hiểu của các bạn học sinh.',
  },
  luc: {
    id: 'luc',
    name: 'Kiến Khám',
    role: 'Chuyên gia Cơ học & Động lực học',
    domain: '⚡ Vật lí & Chuyển động',
    quote: 'Không có vật thể nào bất động nếu bạn tìm đúng điểm tựa và véc-tơ lực!',
    avatarColor: 'bg-blue-600',
    accentColor: 'text-blue-600',
    icon: '⚡',
    description: 'Chú kiến mang giáp trợ lực, đam mê đo đạc áp suất, lực cản và thế năng trong đời sống.',
  },
  no: {
    id: 'no',
    name: 'Kiến Nổ',
    role: 'Nhà Giả kim Phản ứng',
    domain: '🧪 Hóa học & Biến đổi chất',
    quote: 'Liên kết hóa học cũng giống như tình bạn bền chặt của loài kiến vậy!',
    avatarColor: 'bg-purple-600',
    accentColor: 'text-purple-600',
    icon: '🧪',
    description: 'Đeo kính bảo hộ, tò mò về từng phân tử và sự biến đổi diệu kỳ của vật chất.',
  },
  cham_can: {
    id: 'cham_can',
    name: 'Kiến Chăm',
    role: 'Cố vấn Toán học & Logic',
    domain: '📐 Toán học & Cấu trúc số',
    quote: 'Tỉ mỉ từng phép chia, chính xác từng góc cạnh – đó là sức mạnh của kỷ luật!',
    avatarColor: 'bg-emerald-600',
    accentColor: 'text-emerald-600',
    icon: '📐',
    description: 'Chú kiến luôn mang thước cuộn và la bàn, tính toán phân số thần tốc.',
  },
  chi_cu: {
    id: 'chi_cu',
    name: 'Kiến Cần',
    role: 'Trinh sát Tự nhiên & Đa dạng sinh học',
    domain: '🌱 Sinh học & Môi trường',
    quote: 'Hãy quan sát chiếc lá sâu nhất trong rừng, bạn sẽ thấy cả một hệ sinh thái kỳ diệu.',
    avatarColor: 'bg-teal-600',
    accentColor: 'text-teal-600',
    icon: '🔍',
    description: 'Kiến viễn thám kiên nhẫn, luôn tìm thấy những mối liên hệ sinh thái bất ngờ.',
  },
};

export const SUBJECTS_GRADE_5: Subject[] = [
  {
    id: 'toan_5',
    name: 'Toán học',
    code: 'TOAN-5',
    grade: 5,
    iconName: 'Calculator',
    color: 'amber',
    description: 'Phân số, số thập phân, hình học phẳng và giải toán có lời văn thực tế.',
  },
  {
    id: 'tieng_anh_5',
    name: 'Tiếng Anh',
    code: 'ENG-5',
    grade: 5,
    iconName: 'Languages',
    color: 'indigo',
    description: 'Giao tiếp hàng ngày, khám phá thế giới và phản xạ tiếng Anh tự nhiên.',
  },
  {
    id: 'khoa_hoc_5',
    name: 'Khoa học',
    code: 'KH-5',
    grade: 5,
    iconName: 'FlaskConical',
    color: 'emerald',
    description: 'Con người và sức khỏe, vật chất và năng lượng, thực vật và động vật.',
  },
  {
    id: 'ls_dl_5',
    name: 'Lịch sử & Địa lí',
    code: 'LSDL-5',
    grade: 5,
    iconName: 'Compass',
    color: 'orange',
    description: 'Thiên nhiên, con người Việt Nam và những mốc son lịch sử dựng nước.',
  },
  {
    id: 'tin_cn_5',
    name: 'Tin học & Công nghệ',
    code: 'THCN-5',
    grade: 5,
    iconName: 'Cpu',
    color: 'cyan',
    description: 'Tư duy thuật toán cho bé, an toàn số và lắp ráp mô hình kỹ thuật.',
  },
];

export const SUBJECTS_GRADE_8: Subject[] = [
  {
    id: 'khtn_8',
    name: 'Khoa học tự nhiên (KHTN)',
    code: 'KHTN-8',
    grade: 8,
    iconName: 'Atom',
    color: 'blue',
    description: 'Môn học tích hợp liên môn: Vật lí, Hóa học và Sinh học.',
    isIntegrated: true,
    domainBranches: [
      {
        id: 'vat_li',
        name: '⚡ Vật lí',
        icon: 'Zap',
        color: 'blue',
        description: 'Lực, áp suất, cơ năng, nhiệt học và sóng âm.',
      },
      {
        id: 'hoa_hoc',
        name: '🧪 Hóa học',
        icon: 'FlaskRound',
        color: 'purple',
        description: 'Phản ứng hóa học, mol, dung dịch và acid - base.',
      },
      {
        id: 'sinh_hoc',
        name: '🌱 Sinh học',
        icon: 'Leaf',
        color: 'emerald',
        description: 'Cơ thể người, di truyền học và cân bằng sinh thái.',
      },
    ],
  },
  {
    id: 'toan_8',
    name: 'Toán học',
    code: 'TOAN-8',
    grade: 8,
    iconName: 'Binary',
    color: 'amber',
    description: 'Đa thức, hằng đẳng thức đáng nhớ, tứ giác và định lý Thalès.',
  },
  {
    id: 'tieng_anh_8',
    name: 'Tiếng Anh',
    code: 'ENG-8',
    grade: 8,
    iconName: 'Globe',
    color: 'indigo',
    description: 'STEM topics, văn hóa thế giới và tranh biện luận điểm.',
  },
  {
    id: 'cong_nghe_8',
    name: 'Công nghệ',
    code: 'CN-8',
    grade: 8,
    iconName: 'Wrench',
    color: 'rose',
    description: 'Bản vẽ kỹ thuật, cơ khí chế tạo và an toàn điện dân dụng.',
  },
  {
    id: 'tin_hoc_8',
    name: 'Tin học',
    code: 'TIN-8',
    grade: 8,
    iconName: 'Terminal',
    color: 'cyan',
    description: 'Lập trình cấu trúc điều khiển, xử lý dữ liệu và đạo đức mạng.',
  },
];

export const LESSONS: Lesson[] = [
  // Grade 5 SGK Math Lessons Series (Kết nối tri thức với cuộc sống)
  ...GRADE_5_SGK_LESSONS,

  // Grade 5 Featured Interactive Cake Lesson
  {
    id: 'g5_toan_fraction_cake',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chương 1: Phân số & Phép tính phân số',
    title: 'Chia bánh sinh nhật cùng bạn Kiến',
    subtitle: 'Khám phá ý nghĩa phân số và phân số bằng nhau qua chiếc bánh tổ ong kem mật',
    allyId: 'cham_can',
    estimatedMinutes: 12,
    xpReward: 150,
    discover: {
      storyTitle: 'Bữa tiệc sinh nhật trong lòng đất của Vương quốc Kiến',
      storyContent:
        'Hôm nay là sinh nhật của Kiến Con! Các bạn kiến thợ đã làm một chiếc bánh tròn tuyệt đẹp từ kem hoa và mật ong rừng. Có 4 người bạn cùng tham dự: Kiến Con, Kiến Chăm, Kiến Cần và Bé Tí. Để ai cũng vui vẻ và công bằng, chiếc bánh phải được chia thành các phần hoàn toàn bằng nhau!',
      realWorldContext:
        'Trong thực tế, khi chia bánh kem sinh nhật, pizza hay hoa quả cho bạn bè, chúng ta dùng phân số để đảm bảo tính công bằng và chính xác.',
      promptQuestion:
        'Nếu chia chiếc bánh thành 4 miếng bằng nhau và Kiến Con ăn 1 miếng, thì Kiến Con đã ăn bao nhiêu phần của chiếc bánh?',
      keyObservation:
        'Mẫu số chỉ tổng số phần bằng nhau được chia ra. Tử số chỉ số phần mà ta lấy đi!',
    },
    practice: {
      type: 'fraction_cake',
      challengeTitle: 'Xưởng Cắt Bánh & Thử Thách Phân Số Bằng Nhau',
      instructions:
        'Hãy dùng thanh trượt để chia chiếc bánh thành 4 phần, tô màu 2 phần để xem phân số 2/4. Sau đó hãy tìm phân số tối giản tương đương với nó!',
      hintStage1:
        'Hãy quan sát chiếc bánh: Khi chia làm 4 phần bằng nhau và lấy 2 phần, phần bánh đó chiếm đúng một nửa chiếc bánh tròn!',
      hintStage2:
        'Quy tắc vàng: Nếu cùng chia cả tử số và mẫu số của 2/4 cho 2, ta sẽ được phân số 1/2. Hai phân số này có giá trị bằng nhau!',
      fractionData: {
        targetFraction: { num: 2, den: 4 },
        slicesAvailable: [2, 4, 6, 8],
        equivalentFractions: [
          { num: 1, den: 2, isEquivalent: true, label: '1/2 (Một nửa chiếc bánh)' },
          { num: 3, den: 6, isEquivalent: true, label: '3/6 (Ba phần trên sáu phần)' },
          { num: 4, den: 8, isEquivalent: true, label: '4/8 (Bốn phần trên tám phần)' },
          { num: 2, den: 6, isEquivalent: false, label: '2/6 (Hai phần trên sáu phần)' },
          { num: 3, den: 4, isEquivalent: false, label: '3/4 (Ba phần trên bốn phần)' },
        ],
      },
    },
    apply: {
      dilemmaTitle: 'Tình huống dã ngoại: Vị khách bất ngờ!',
      situation:
        'Sau khi ăn hết 1/4 chiếc bánh, trên đĩa còn lại đúng 3/4 chiếc bánh. Đúng lúc này, có 3 bạn kiến thám hiểm vừa đi tuần tra về đói lả. Các bạn muốn chia đều số bánh còn lại cho cả 3 bạn.',
      question: 'Cách xử lý nào sau đây vừa công bằng vừa thể hiện tư duy toán học chuẩn nhất?',
      options: [
        {
          id: 'opt_1',
          title: 'Mỗi bạn nhận đúng 1/4 chiếc bánh',
          description: 'Vì còn 3 miếng (mỗi miếng là 1/4 bánh), chia đều cho 3 người thì mỗi người được chính xác 1 miếng (1/4 bánh).',
          isOptimal: true,
          scientificReason: 'Phép tính: 3/4 chia cho 3 = 1/4. Rất chính xác và nhanh chóng!',
        },
        {
          id: 'opt_2',
          title: 'Cắt vụn toàn bộ bánh ra để đong đếm',
          description: 'Nghiền nhỏ bánh rồi dùng thìa xúc chia đều cho 3 bạn.',
          isOptimal: false,
          scientificReason: 'Làm hỏng kết cấu bánh và mất thời gian, trong khi 3 phần 1/4 vốn đã bằng nhau sẵn.',
        },
        {
          id: 'opt_3',
          title: 'Ưu tiên bạn kiến thợ lớn nhất ăn 2/4 bánh',
          description: 'Bạn lớn hơn ăn 2/4, hai bạn nhỏ mỗi bạn ăn 1/8.',
          isOptimal: false,
          scientificReason: 'Không bảo đảm nguyên tắc chia đều và công bằng trong bài toán.',
        },
      ],
      hintStage1: 'Hãy đếm xem còn bao nhiêu miếng bánh cỡ 1/4 trên đĩa?',
      hintStage2: 'Có 3 miếng 1/4 bánh, chia cho đúng 3 người thì mỗi người nhận được bao nhiêu miếng?',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con (Teach-Back)',
      guidingQuestion:
        'Bạn hãy giải thích cho Kiến Con nghe: "Làm thế nào bạn biết phân số 2/4 và 1/2 có giá trị hoàn toàn bằng nhau khi chia bánh kem?"',
      helperBulletPoints: [
        'Nhắc đến việc chia bánh thành mấy phần bằng nhau',
        'Tử số chỉ điều gì và mẫu số chỉ điều gì',
        'Hình ảnh trực quan: 2 miếng nhỏ khi ghép lại có bằng nửa chiếc bánh không?',
      ],
      sampleStarters: [
        'Kiến ơi, khi mình cắt bánh làm 4 miếng bằng nhau rồi lấy 2 miếng...',
        'Phân số 2/4 bằng 1/2 vì khi nhìn vào hình tròn, phần được tô màu chiếm...',
      ],
      expectedConcepts: ['phần bằng nhau', 'tử số', 'mẫu số', 'một nửa', 'chia đều'],
    },
  },

  // Grade 8 Featured Lesson (KHTN - Physics Branch)
  {
    id: 'g8_khtn_sand_bike_tires',
    subjectId: 'khtn_8',
    domainBranch: 'vat_li',
    grade: 8,
    unit: 'Chủ đề 3: Lực và Chuyển động - Áp suất chất rắn',
    title: 'Thiết kế lốp xe đạp vượt cát Mũi Né',
    subtitle: 'Nghiên cứu áp suất p = F/S, phản lực mặt đường và tối ưu hóa diện tích tiếp xúc trên đồi cát lún',
    allyId: 'luc',
    estimatedMinutes: 15,
    xpReward: 200,
    discover: {
      storyTitle: 'Cuộc đua xe đạp địa hình trên đồi Cát Đỏ Mũi Né (Bình Thuận)',
      storyContent:
        'Câu lạc bộ thám hiểm trường An tổ chức chuyến đạp xe dã ngoại qua Đồi Cát Đỏ Mũi Né. Những chiếc xe đạp đua lốp mảnh (25mm) bị lún sâu gần 10cm vào cát mịn, bánh sau quay tít tại chỗ và trượt ngược xuống dốc! Trong khi đó, chiếc xe lốp béo (Fat-bike 100mm) của người dẫn đường lại lướt êm ái trên mặt cát.',
      realWorldContext:
        'Tại các vùng sa mạc, bờ biển cát lún như Mũi Né hay công trường xây dựng nền đất yếu, các kỹ sư luôn phải tính toán áp suất tác dụng p = F/S để ngăn phương tiện bị lún chìm.',
      promptQuestion:
        'Tại sao cùng một người lái và khối lượng xe tương đương, xe lốp bản rộng lại không bị lún cát, còn xe lốp hẹp lại chìm sâu?',
      keyObservation:
        'Trọng lực tác dụng F không đổi. Khi tăng diện tích tiếp xúc S, áp suất đè lên mặt cát p = F/S sẽ giảm mạnh!',
    },
    practice: {
      type: 'tire_physics_sim',
      challengeTitle: 'Mô Phỏng Phòng Thí Nghiệm Khí Động Học & Áp Suất Bề Mặt',
      instructions:
        'Hãy chọn kích cỡ lốp xe, điều chỉnh áp suất bơm và quan sát độ lún của lốp trên lớp cát Mũi Né. Mục tiêu: Giữ áp suất p < 150 kPa để xe vượt cát thành công!',
      hintStage1:
        'Hãy chú ý công thức tính áp suất chất rắn: p = F / S. Trong đó F là áp lực (N), S là diện tích tiếp xúc (m²).',
      hintStage2:
        'Muốn p nhỏ hơn giới hạn chịu lực của cát rời (150 kPa), ta bắt buộc phải TĂNG diện tích tiếp xúc S bằng lốp xe bản rộng hoặc giảm áp suất bơm để lốp bè ra.',
      physicsData: {
        riderMassKg: 65, // F = 650 N
        sandBearingLimitPa: 140000, // 140 kPa
        tires: [
          {
            id: 'road_narrow',
            name: 'Lốp Road Đua Siêu Mảnh (25mm)',
            widthMm: 25,
            contactAreaCm2: 45, // Total 2 tires = 90 cm2 = 0.009 m2 => p = 650 / 0.009 ~ 72,222 Pa per tire => ~144 kPa with dynamic rider
            treadType: 'smooth',
            frictionCoeff: 0.28,
            description: 'Lốp trơn, diện tích tiếp xúc rất nhỏ. Áp suất cực lớn (> 220 kPa khi dồn trọng tâm), lún sâu 9cm vào cát.',
          },
          {
            id: 'gravel_medium',
            name: 'Lốp Gravel Địa Hình Vừa (45mm)',
            widthMm: 45,
            contactAreaCm2: 85, // Total ~ 170 cm2
            treadType: 'grooved',
            frictionCoeff: 0.52,
            description: 'Gai lốp nhỏ, diện tích tiếp xúc trung bình. Áp suất khoảng 150 kPa, lún nhẹ 3cm, đạp khá nặng trên cát xốp.',
          },
          {
            id: 'fatbike_wide',
            name: 'Lốp Béo Thám Hiểm Sa Mạc (Fat-Tire 100mm)',
            widthMm: 100,
            contactAreaCm2: 190, // Total ~ 380 cm2 => p = 650 / 0.038 ~ 17.1 kPa!
            treadType: 'deep_lug',
            frictionCoeff: 0.78,
            description: 'Bản lốp siêu rộng, bơm áp suất thấp (12 PSI). Diện tích tiếp xúc khổng lồ, áp suất chỉ ~40 kPa, xe lướt nhẹ trên mặt cát!',
          },
        ],
      },
    },
    apply: {
      dilemmaTitle: 'Nhiệm vụ địa hình: Đổ dốc cát nghiêng 25 độ',
      situation:
        'Khi nhóm của An chuẩn bị đổ dốc cát dốc 25 độ ở đồi cát Mũi Né, cát phía trước rất tơi xốp do gió biển vừa thổi qua. Nếu phanh gấp bánh trước bằng lực mạnh, nguy cơ xe cắm đầu lật úp là rất cao.',
      question: 'Là cố vấn kỹ thuật của nhóm, bạn khuyến nghị chiến thuật lái và căn chỉnh nào?',
      options: [
        {
          id: 'opt_a',
          title: 'Hạ trọng tâm về sau, nhấp nhả phanh sau và giữ lốp béo ở áp suất thấp',
          description: 'Dồn trọng lượng cơ thể ra sau yên, tận dụng lực ma sát nghỉ của gai lốp lớn và diện tích tiếp xúc rộng để hãm tốc từ từ.',
          isOptimal: true,
          scientificReason: 'Tránh ngẫu lực làm lật xe quanh trục bánh trước, đồng thời phân bổ áp lực đều lên bánh sau mà không phá vỡ cấu trúc hạt cát.',
        },
        {
          id: 'opt_b',
          title: 'Bóp chặt phanh trước hết cỡ để dừng xe ngay lập tức',
          description: 'Khóa cứng bánh trước để bánh cày sâu vào cát làm điểm neo.',
          isOptimal: false,
          scientificReason: 'Cực kỳ nguy hiểm! Lực cản đột ngột tại chân bánh tạo mô-men quay làm lật xe và người về phía trước theo quán tính.',
        },
        {
          id: 'opt_c',
          title: 'Bơm căng lốp lên 60 PSI để giảm ma sát lăn',
          description: 'Lốp càng căng thì xe lăn càng nhanh xuống dốc.',
          isOptimal: false,
          scientificReason: 'Bơm căng làm giảm diện tích tiếp xúc S, khiến áp suất p tăng vọt và bánh xe bị chìm ngập vào cát lún.',
        },
      ],
      hintStage1: 'Hãy nhớ lại hiện tượng quán tính và vị trí trọng tâm khi đổ dốc.',
      hintStage2: 'Để phanh an toàn trên bề mặt rời rạc, cần ưu tiên bánh sau và diện tích tiếp xúc S lớn.',
    },
    teachBack: {
      promptTitle: 'Báo cáo Khoa học cho Kiến Con (Teach-Back)',
      guidingQuestion:
        'Dựa trên công thức áp suất p = F/S và các định luật ma sát, bạn hãy giải thích: "Tại sao việc tăng độ rộng lốp xe và hạ bớt áp suất khí bơm trong lốp lại là giải pháp tối ưu khi di chuyển trên địa hình cát lún Mũi Né?"',
      helperBulletPoints: [
        'Phân tích mối quan hệ nghịch đảo giữa áp suất p và diện tích tiếp xúc S',
        'Giải thích khả năng chịu tải của các hạt cát rời rạc',
        'Liên hệ lực ma sát trượt và ma sát nghỉ khi leo dốc cát',
      ],
      sampleStarters: [
        'Kiến Con ơi, theo công thức p = F / S, khi trọng lực F không đổi...',
        'Khi tăng bề rộng của lốp và giảm áp suất bơm, mặt lốp sẽ bè ra làm diện tích tiếp xúc S tăng lên, dẫn đến...',
      ],
      expectedConcepts: ['p = F / S', 'áp suất', 'diện tích tiếp xúc', 'áp lực', 'lực ma sát', 'lún cát'],
    },
  },

  // Grade 8 Chemistry Featured Lesson (KHTN - Chemistry Branch)
  {
    id: 'g8_khtn_chem_reaction_rate',
    subjectId: 'khtn_8',
    domainBranch: 'hoa_hoc',
    grade: 8,
    unit: 'Chủ đề 2: Tốc độ phản ứng & Chất xúc tác',
    title: 'Bài 9: Tốc độ phản ứng và chất xúc tác trong đời sống',
    subtitle: 'Khám phá 4 yếu tố điều khiển tốc độ phản ứng: nồng độ, nhiệt độ, diện tích tiếp xúc và enzyme xúc tác',
    allyId: 'no',
    estimatedMinutes: 10,
    xpReward: 200,
    discover: {
      storyTitle: 'Thí nghiệm bí mật dưới lòng đất của Kiến Nổ & Kiến Con',
      storyContent:
        'Trong phòng thí nghiệm dưới lòng đất của làng Kiến, Kiến Con đang cùng người bạn tinh nghịch Kiến Nổ chuẩn bị nhiên liệu phát sáng cho lễ hội hoa đăng. Kiến Nổ sốt ruột vì thấy phản ứng tạo khí sủi bọt quá chậm, toan đổ dồn tất cả hóa chất vào cùng một lúc! Kiến liền can ngăn và rủ Kiến Nổ cùng làm chuỗi thí nghiệm khám phá xem những "chiếc chìa khóa" nào có thể điều khiển tốc độ phản ứng nhanh hay chậm theo ý muốn.',
      realWorldContext:
        'Bí quyết đun bếp củi nhanh cháy của bà ở quê, hiện tượng muối dưa cà mau chua vào mùa hè, và ứng dụng men nở khi làm bánh mì Việt Nam giòn xốp.',
      promptQuestion:
        'Khi quan sát một viên sủi vitamin C thả vào cốc nước lạnh và một viên cùng loại thả vào cốc nước ấm, hiện tượng nào chứng tỏ phản ứng trong cốc nước ấm diễn ra với tốc độ nhanh hơn?',
      keyObservation:
        'Tốc độ phản ứng hóa học được đo bằng sự biến đổi lượng chất trong một đơn vị thời gian. Trong cốc nước ấm, bọt khí CO₂ sủi lên mãnh liệt và viên sủi tan hết trong thời gian ngắn hơn rất nhiều!',
    },
    practice: {
      type: 'matching',
      challengeTitle: 'Phòng Thí Nghiệm Của Kiến Nổ: Ghép Nối Yếu Tố & Hiện Tượng',
      instructions:
        'Hãy ghép mỗi biện pháp dân gian/thực tế đời sống với yếu tố ảnh hưởng đến tốc độ phản ứng tương ứng để kích hoạt hoàn toàn lò phản ứng của Kiến Nổ!',
      hintStage1:
        'Tốc độ phản ứng hóa học chịu ảnh hưởng của 4 yếu tố chính: Nhiệt độ, Nồng độ chất phản ứng, Diện tích tiếp xúc bề mặt và Chất xúc tác (Enzyme sinh học).',
      hintStage2:
        'Hãy liên tưởng: Chẻ nhỏ củi làm tăng diện tích tiếp xúc với Oxygen. Tủ lạnh hạ nhiệt độ để thức ăn lâu hỏng. Men vi sinh là chất xúc tác sinh học!',
      matchingData: {
        pairs: [
          {
            id: 'p1',
            fact: 'Chẻ nhỏ củi và dùng que cời nhóm bếp lò',
            factor: 'Tăng diện tích tiếp xúc bề mặt',
            explanation:
              'Chẻ nhỏ giúp thanh củi tăng diện tích tiếp xúc với Oxygen trong không khí, giúp phản ứng cháy diễn ra nhanh hơn gấp nhiều lần!',
          },
          {
            id: 'p2',
            fact: 'Bảo quản thịt tươi, rau củ trong ngăn đông tủ lạnh',
            factor: 'Hạ nhiệt độ môi trường',
            explanation:
              'Nhiệt độ thấp làm giảm chuyển động nhiệt của phân tử và kìm hãm tốc độ các phản ứng sinh hóa, giúp thức ăn lâu bị ôi thiu.',
          },
          {
            id: 'p3',
            fact: 'Dùng quạt thổi thêm không khí vào bếp than tổ ong đang bén',
            factor: 'Tăng nồng độ chất phản ứng (Oxygen)',
            explanation:
              'Thổi quạt liên tục cung cấp lượng lớn khí O₂ có nồng độ cao vào bề mặt than, tăng số lần va chạm hiệu quả giữa than và Oxygen.',
          },
          {
            id: 'p4',
            fact: 'Rắc men vi sinh khi làm sữa chua hoặc ủ rượu nếp',
            factor: 'Sử dụng chất xúc tác (Enzyme sinh học)',
            explanation:
              'Enzyme men đóng vai trò chất xúc tác sinh học giúp đường lên men thần tốc mà chính nó không bị tiêu hao sau phản ứng!',
          },
        ],
      },
    },
    apply: {
      dilemmaTitle: 'Thử thách ẩm thực: Nồi gân bò sốt vang lúc 18h15',
      situation:
        'Gia đình bạn Nam chuẩn bị hầm một nồi gân bò nấu sốt vang để ăn cùng bánh mì vào bữa tối lúc 19h00. Bây giờ đã là 18h15 mà thịt bò hầm bằng nồi gang thông thường vẫn còn rất dai. Mẹ Nam nhớ ra trong bếp có một chiếc nồi áp suất và vài quả dứa (khóm) tươi.',
      question:
        'Để thịt bò mềm nhừ nhanh nhất trong vòng 30 phút mà vẫn an toàn và thơm ngon, giải pháp khoa học tối ưu nhất là gì?',
      options: [
        {
          id: 'opt_pressure_pineapple',
          title: 'Chuyển sang nồi áp suất kết hợp ướp thêm vài lát dứa tươi',
          description:
            'Nồi áp suất nâng nhiệt độ sôi lên 115-120°C (tăng nhiệt độ), còn dứa cung cấp enzyme bromelain (xúc tác sinh học) cắt đứt chuỗi collagen trong gân bò.',
          isOptimal: true,
          scientificReason:
            'Giải pháp tối ưu tuyệt đối! Kết hợp cả hai yếu tố đắc lực: Tăng nhiệt độ phản ứng phân giải protein và bổ sung chất xúc tác sinh học tự nhiên, giúp thịt mềm nhanh gấp 3-4 lần!',
        },
        {
          id: 'opt_salt_low_fire',
          title: 'Cho thêm thật nhiều muối ăn vào nồi gang mở vung đun lửa nhỏ',
          description: 'Rắc muối đậm đà rồi tiếp tục ninh liu riu trên bếp gang mở nắp.',
          isOptimal: false,
          scientificReason:
            'Lửa nhỏ làm hạ nhiệt độ nước, nước bay hơi nhanh khiến thịt vẫn dai và có nguy cơ cạn nước cháy khét đáy nồi.',
        },
        {
          id: 'opt_big_flame_only',
          title: 'Để nguyên miếng thịt to và tăng ngọn lửa bếp gas lên mức tối đa',
          description: 'Không cắt nhỏ, tăng lửa to hết cỡ ở nồi gang thông thường.',
          isOptimal: false,
          scientificReason:
            'Nồi gang hở vung thì nhiệt độ nước sôi chỉ đạt 100°C; lửa to chỉ làm cạn nước chứ không tăng được nhiệt độ. Miếng thịt to có diện tích tiếp xúc nhỏ nên nhiệt khó truyền vào lõi.',
        },
        {
          id: 'opt_ice_water',
          title: 'Đổ thêm nước đá lạnh vào nồi để sốc nhiệt làm mềm sợi cơ thịt',
          description: 'Thêm nước đá làm thay đổi nhiệt độ đột ngột.',
          isOptimal: false,
          scientificReason:
            'Nước đá làm nhiệt độ giảm đột ngột, tốc độ phản ứng phân giải collagen bị ngừng trệ hoàn toàn.',
        },
      ],
      hintStage1:
        'Hãy nghĩ về hai yếu tố cốt lõi: Làm sao để nhiệt độ nước sôi vượt qua 100°C? Và trong quả dứa có chất gì đặc biệt giúp làm mềm thịt?',
      hintStage2:
        'Nồi áp suất làm tăng áp suất hơi nước khiến nhiệt độ sôi đạt 115-120°C. Dứa tươi chứa enzyme bromelain đóng vai trò chất xúc tác sinh học!',
    },
    teachBack: {
      promptTitle: 'Báo cáo Khoa học cho Kiến Nổ & Kiến Con (Teach-Back)',
      guidingQuestion:
        'Kiến Nổ thắc mắc: "Tại sao chất xúc tác làm phản ứng xảy ra nhanh hơn rất nhiều, nhưng sau khi kết thúc phản ứng thì khối lượng của nó lại không hề bị tiêu hao? Hãy giải thích cho Kiến Nổ nghe bản chất nhé!"',
      helperBulletPoints: [
        'Giải thích khái niệm chất xúc tác và tốc độ phản ứng',
        'Cơ chế: Mở ra con đường phản ứng mới có năng lượng hoạt hóa thấp hơn',
        'Chất xúc tác chỉ tham gia các giai đoạn trung gian rồi được tái tạo nguyên vẹn',
        'Liên hệ thực tế: Men làm bánh mì, men ủ rượu nếp hay enzyme tiêu hóa trong cơ thể',
      ],
      sampleStarters: [
        'Kiến Nổ ơi, chất xúc tác giống như một người dẫn đường thông thái, mở ra con đường tắt có năng lượng hoạt hóa thấp hơn...',
        'Chất xúc tác làm phản ứng xảy ra nhanh hơn vì nó hạ thấp năng lượng hoạt hóa, và nó không bị tiêu hao vì...',
      ],
      expectedConcepts: [
        'chất xúc tác',
        'tăng tốc độ',
        'không bị tiêu hao',
        'không bị biến đổi hóa học',
        'năng lượng hoạt hóa',
        'tái tạo nguyên vẹn',
      ],
    },
  },
];

export const INITIAL_USER_GRADE_5: UserProfile = {
  id: 'student_grade_5',
  name: 'Minh',
  nickname: 'Kiến Chăm Học',
  birthDate: '2014-08-15',
  email: 'minh.ant5@kienhoc.edu.vn',
  password: '••••••••',
  grade: 5,
  avatar: '👦',
  xp: 340,
  level: 3,
  streakDays: 4,
  lastActiveDate: new Date().toISOString(),
  completedLessons: [],
  subjectMastery: {
    toan_5: 45,
    tieng_anh_5: 30,
    khoa_hoc_5: 60,
    ls_dl_5: 25,
    tin_cn_5: 40,
  },
  inventory: ['Huy hiệu Kiến Chăm', 'Thước Kẻ Gỗ', 'Kính Lúp Sinh Học'],
  themeSettings: {
    mode: 'light',
    accentColor: 'amber',
    soundEnabled: true,
    soundVolume: 80,
    ambientChime: false,
  },
};

export const INITIAL_USER_GRADE_8: UserProfile = {
  id: 'student_grade_8',
  name: 'An',
  nickname: 'Kiến Thông Thái',
  birthDate: '2011-03-22',
  email: 'an.khtn8@kienhoc.edu.vn',
  password: '••••••••',
  grade: 8,
  avatar: '🧑‍🎓',
  xp: 860,
  level: 6,
  streakDays: 7,
  lastActiveDate: new Date().toISOString(),
  completedLessons: [],
  subjectMastery: {
    khtn_8: 68,
    toan_8: 72,
    tieng_anh_8: 55,
    cong_nghe_8: 62,
    tin_hoc_8: 80,
  },
  inventory: ['Huy hiệu Kỹ Sư Nhí', 'Đồng Hồ Áp Suất', 'Mô hình Tinh Thể'],
  themeSettings: {
    mode: 'light',
    accentColor: 'sky',
    soundEnabled: true,
    soundVolume: 85,
    ambientChime: false,
  },
};

export const INITIAL_QUESTS: DailyQuest[] = [
  {
    id: 'q_lesson_1',
    grade: 5,
    title: 'Thám hiểm phân số',
    description: 'Hoàn thành 1 bài học về phân số cùng Kiến Con',
    progress: 0,
    target: 1,
    xpReward: 50,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q_teachback_5',
    grade: 5,
    title: 'Thầy giáo Kiến tí hon',
    description: 'Giải thích lại một khái niệm trong phần Teach-back',
    progress: 0,
    target: 1,
    xpReward: 70,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q_streak_5',
    grade: 5,
    title: 'Giữ lửa đam mê',
    description: 'Duy trì chuỗi học tập 4 ngày liên tiếp',
    progress: 4,
    target: 4,
    xpReward: 40,
    isCompleted: true,
    isClaimed: false,
  },
  {
    id: 'q_physics_8',
    grade: 8,
    title: 'Kỹ sư địa hình Mũi Né',
    description: 'Tối ưu hóa áp suất lốp xe vượt cát trong bài thí nghiệm KHTN',
    progress: 0,
    target: 1,
    xpReward: 80,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q_chem_8',
    grade: 8,
    title: 'Nhà giả kim của Kiến Nổ',
    description: 'Chinh phục bài học Tốc độ phản ứng & Chất xúc tác cùng Kiến Nổ',
    progress: 0,
    target: 1,
    xpReward: 80,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q_teachback_8',
    grade: 8,
    title: 'Bảo vệ luận điểm khoa học',
    description: 'Ghi điểm Teach-back trên 80 với Kiến Con',
    progress: 0,
    target: 1,
    xpReward: 100,
    isCompleted: false,
    isClaimed: false,
  },
  {
    id: 'q_streak_8',
    grade: 8,
    title: 'Nhà nghiên cứu kiên định',
    description: 'Đạt chuỗi học tập 7 ngày liên tiếp',
    progress: 7,
    target: 7,
    xpReward: 60,
    isCompleted: true,
    isClaimed: false,
  },
];
