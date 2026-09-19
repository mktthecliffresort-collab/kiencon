import { Lesson } from '../types';

export const GRADE_5_SGK_LESSONS: Lesson[] = [
  // ==========================================
  // CHỦ ĐỀ 1: ÔN TẬP VÀ BỔ SUNG
  // ==========================================
  {
    id: 'g5_toan_b1_so_tu_nhien',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 1)',
    title: 'Ôn tập số tự nhiên & Mật mã mũ số chẵn của Rô-bốt',
    subtitle: 'Đọc, viết, phân tích cấu tạo hàng triệu và giải câu đố ba số chẵn liên tiếp (trang 6, 7)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Rô-bốt và mật mã ba chiếc mũ số chẵn',
      storyContent:
        'Bạn Rô-bốt, Việt và Nam cùng chơi một trò chơi bí ẩn trong vương quốc kiến: Ba số chẵn liên tiếp được viết vào 3 chiếc mũ, mỗi bạn đội một chiếc. Rô-bốt nhìn thấy mũ của Việt ghi số 2 032 và mũ của Nam ghi số 2 028. Rô-bốt đang băn khoăn không biết số trên mũ của mình là bao nhiêu!',
      realWorldContext:
        'Số tự nhiên và các hàng số (đơn vị, chục, trăm, nghìn, triệu) xuất hiện trong mã số học sinh, số dân, giá trị tiền tệ và ngày tháng lịch sử.',
      promptQuestion:
        'Nếu ba số chẵn liên tiếp có hai số là 2 028 và 2 032, số chẵn nằm chính giữa hai số này là số nào?',
      keyObservation:
        'Hai số chẵn liên tiếp luôn hơn kém nhau đúng 2 đơn vị. Số ở giữa 2 028 và 2 032 phải là 2 030!',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Khai Phá Số Tự Nhiên & Hàng Số',
      instructions:
        'Cùng Kiến Con giải các bài toán thực hành từ trang 6 và 7 SGK Toán 5: xác định giá trị chữ số, phân tích tổng và tìm số bí ẩn!',
      hintStage1:
        'Hãy nhớ cấu tạo số: Hàng chục triệu, triệu, trăm nghìn, chục nghìn, nghìn, trăm, chục, đơn vị.',
      hintStage2:
        'Số 504 842 = 500 000 + 4 000 + 800 + 40 + 2.',
      mathTasks: [
        {
          id: 'b1_task1',
          title: 'Bài 1: Phân tích số (SGK trang 6)',
          prompt: 'Số gồm 3 chục triệu, 8 nghìn, 2 chục và 1 đơn vị được viết là số nào?',
          type: 'multiple_choice',
          options: [
            { id: 'opt1', text: '30 008 021', isCorrect: true },
            { id: 'opt2', text: '3 080 021', isCorrect: false },
            { id: 'opt3', text: '30 821', isCorrect: false },
            { id: 'opt4', text: '38 000 021', isCorrect: false },
          ],
          socraticClue: 'Hàng chục triệu là 3, hàng triệu là 0, hàng trăm nghìn và chục nghìn là 0, hàng nghìn là 8, hàng trăm là 0, hàng chục là 2, hàng đơn vị là 1.',
          explanation: 'Chính xác! Các hàng khuyết (triệu, trăm nghìn, chục nghìn, trăm) đều được điền chữ số 0.',
        },
        {
          id: 'b1_task2',
          title: 'Bài 2: Tìm số còn thiếu (SGK trang 6)',
          prompt: 'Điền số thích hợp vào dấu ?: \n504 842 = 500 000 + 4 000 + [ ? ] + 40 + 2',
          type: 'number_input',
          correctAnswer: '800',
          acceptableAnswers: ['800'],
          socraticClue: 'Chữ số 8 đứng ở hàng trăm, nên giá trị của nó là 8 trăm.',
          explanation: 'Đúng rồi! Chữ số 8 thuộc hàng trăm nên có giá trị là 800.',
        },
        {
          id: 'b1_task3',
          title: 'Bài 3: Câu đố ba chiếc mũ (SGK trang 7)',
          prompt: 'Việt đội mũ ghi số 2 032, Nam đội mũ ghi số 2 028. Hỏi Rô-bốt đội chiếc mũ ghi số nào để tạo thành ba số chẵn liên tiếp?',
          type: 'number_input',
          correctAnswer: '2030',
          acceptableAnswers: ['2030', '2 030'],
          socraticClue: 'Số chẵn đứng liền sau 2 028 và liền trước 2 032.',
          explanation: 'Xuất sắc! Ba số chẵn liên tiếp cách nhau 2 đơn vị: 2 028; 2 030; 2 032.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Thử thách: Đổi thẻ lập số lẻ lớn nhất (SGK trang 8)',
      situation:
        'Rô-bốt dùng 6 tấm thẻ lập được số 863 749. Rô-bốt muốn đổi chỗ 2 tấm thẻ bất kì để được một SỐ LẺ LỚN NHẤT có thể.',
      question: 'Kiến Con nên khuyên Rô-bốt đổi chỗ hai tấm thẻ nào?',
      options: [
        {
          id: 'opt_1',
          title: 'Đổi chỗ thẻ [6] và [7] thành số 873 649',
          description: 'Hàng chục nghìn tăng từ 6 lên 7, và chữ số tận cùng vẫn là 9 (số lẻ lớn nhất).',
          isOptimal: true,
          scientificReason: 'Số 873 649 có hàng trăm nghìn giữ nguyên là 8, hàng chục nghìn lớn nhất có thể là 7, và tận cùng là 9 đảm bảo số lẻ.',
        },
        {
          id: 'opt_2',
          title: 'Đổi chỗ thẻ [9] và [8] thành số 963 748',
          description: 'Để có chữ số 9 ở hàng cao nhất.',
          isOptimal: false,
          scientificReason: 'Khi đưa 8 về tận cùng, số thu được là 963 748 - đây là số CHẴN, không thỏa mãn yêu cầu số lẻ!',
        },
        {
          id: 'opt_3',
          title: 'Đổi chỗ thẻ [3] và [7] thành số 867 349',
          description: 'Tăng hàng nghìn từ 3 lên 7.',
          isOptimal: false,
          scientificReason: 'Số 867 349 vẫn bé hơn số 873 649 vì 867 nghìn < 873 nghìn.',
        },
      ],
      hintStage1: 'Số lẻ có chữ số tận cùng là 1, 3, 5, 7 hoặc 9.',
      hintStage2: 'Muốn số lớn nhất, các hàng cao hơn (trăm nghìn, chục nghìn) phải có chữ số càng lớn càng tốt.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Cấu tạo số tự nhiên',
      guidingQuestion:
        'Làm thế nào để bạn phân biệt được "chữ số" và "giá trị của chữ số đó trong một số"? Hãy lấy ví dụ chữ số 8 trong số 504 842.',
      helperBulletPoints: [
        'Vị trí hàng mà chữ số đó đứng',
        'Giá trị của chữ số phụ thuộc vào vị trí hàng như thế nào',
        'Ví dụ cụ thể với số 504 842',
      ],
      sampleStarters: [
        'Kiến ơi, chữ số là kí hiệu viết (từ 0 đến 9), còn giá trị của nó thì...',
        'Trong số 504 842, chữ số 8 đứng ở hàng trăm nên giá trị của nó là...',
      ],
      expectedConcepts: ['hàng số', 'giá trị chữ số', 'hàng trăm', 'cấu tạo số'],
    },
  },

  {
    id: 'g5_toan_b2_phep_tinh_so_tu_nhien',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 2)',
    title: 'Ôn tập 4 phép tính & Bài toán bim bim của Mai',
    subtitle: 'Cộng, trừ, nhân, chia số tự nhiên, tính nhanh bằng cách thuận tiện và giải toán có lời văn (trang 9, 10)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Mai mua bim bim cua và bim bim mực',
      storyContent:
        'Mai đi siêu thị mua hai gói bim bim hết tất cả 18 000 đồng. Trong đó, gói bim bim cua có giá đắt hơn gói bim bim mực là 4 000 đồng. Mai muốn biết chính xác giá tiền của mỗi gói bim bim để chia tiền cùng các bạn kiến.',
      realWorldContext:
        'Đây chính là dạng toán kinh điển "Tìm hai số khi biết Tổng và Hiệu" thường xuyên gặp khi đi chợ và quản lý chi tiêu.',
      promptQuestion:
        'Khi biết Tổng là 18 000 đồng và Hiệu là 4 000 đồng, ta tìm số lớn (giá bim bim cua) bằng công thức nào?',
      keyObservation:
        'Số lớn = (Tổng + Hiệu) : 2. Số bé = (Tổng - Hiệu) : 2.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Đấu Trường Tính Nhanh Thuận Tiện',
      instructions:
        'Thực hiện các phép tính và áp dụng tính chất giao hoán, kết hợp, nhân một số với một tổng từ SGK trang 9 & 10.',
      hintStage1: 'Tìm các cặp số tròn chục, tròn trăm như 25 x 4 = 100, 17 + 83 = 100.',
      hintStage2: '2 025 x 17 + 83 x 2 025 = 2 025 x (17 + 83).',
      mathTasks: [
        {
          id: 'b2_task1',
          title: 'Bài 1: Tính thuận tiện (SGK trang 10)',
          prompt: 'Tính nhanh giá trị biểu thức: \n25 × 99 × 4',
          type: 'number_input',
          correctAnswer: '9900',
          acceptableAnswers: ['9900', '9 900'],
          socraticClue: 'Nhóm (25 × 4) lại trước để được 100.',
          explanation: 'Chính xác! (25 × 4) × 99 = 100 × 99 = 9 900.',
        },
        {
          id: 'b2_task2',
          title: 'Bài 2: Đưa về thừa số chung (SGK trang 10)',
          prompt: 'Tính nhanh: 2 025 × 17 + 83 × 2 025',
          type: 'number_input',
          correctAnswer: '202500',
          acceptableAnswers: ['202500', '202 500'],
          socraticClue: 'Đặt 2 025 ra ngoài: 2 025 × (17 + 83).',
          explanation: 'Quá đỉnh! 2 025 × 100 = 202 500.',
        },
        {
          id: 'b2_task3',
          title: 'Bài 3: Trung bình giá tranh Rô-bốt (SGK trang 10)',
          prompt: 'Rô-bốt bán 4 bức tranh với giá: 85 500 đồng, 150 000 đồng, 425 000 đồng và 55 500 đồng. Trung bình mỗi bức tranh có giá bao nhiêu tiền?',
          type: 'number_input',
          correctAnswer: '179000',
          acceptableAnswers: ['179000', '179 000'],
          unit: 'đồng',
          socraticClue: 'Tính tổng giá 4 bức tranh rồi chia cho 4. Tổng = 85 500 + 150 000 + 425 000 + 55 500 = 716 000 đồng.',
          explanation: 'Tuyệt vời! 716 000 : 4 = 179 000 đồng.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Giải bài toán bim bim của Mai (SGK trang 9)',
      situation:
        'Tổng số tiền Mai trả là 18 000 đồng. Gói bim bim cua đắt hơn bim bim mực 4 000 đồng. Mai cần tính giá của gói bim bim cua.',
      question: 'Giá tiền của gói bim bim cua là bao nhiêu?',
      options: [
        {
          id: 'opt_1',
          title: '11 000 đồng (Bim bim cua) và 7 000 đồng (Bim bim mực)',
          description: '(18 000 + 4 000) : 2 = 11 000 đồng.',
          isOptimal: true,
          scientificReason: 'Chính xác! Kiểm tra lại: 11 000 + 7 000 = 18 000 đồng và 11 000 - 7 000 = 4 000 đồng.',
        },
        {
          id: 'opt_2',
          title: '14 000 đồng và 4 000 đồng',
          description: 'Lấy 18 000 trừ đi 4 000.',
          isOptimal: false,
          scientificReason: '14 000 + 4 000 = 18 000 nhưng 14 000 - 4 000 = 10 000 (hiệu sai).',
        },
      ],
      hintStage1: 'Giá bim bim cua = (Tổng + Hiệu) : 2.',
      hintStage2: '(18 000 + 4 000) : 2 = 22 000 : 2 = 11 000 đồng.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Mẹo tính thuận tiện',
      guidingQuestion:
        'Bạn hãy giải thích cho Kiến Con: "Tại sao khi gặp phép tính 25 x 99 x 4, việc đổi chỗ thành (25 x 4) x 99 lại giúp ta tính nhẩm siêu nhanh?"',
      helperBulletPoints: [
        'Tính chất giao hoán của phép nhân',
        'Số tròn trăm (100) có điều gì đặc biệt khi nhân',
        'Không cần đặt bút tính nháp dài dòng',
      ],
      sampleStarters: [
        'Kiến ơi, phép nhân có tính chất giao hoán nên mình có thể ghép...',
        'Khi nhân một số với 100, ta chỉ việc thêm...',
      ],
      expectedConcepts: ['tính chất giao hoán', 'số tròn trăm', 'nhân nhẩm', 'tiết kiệm thời gian'],
    },
  },

  {
    id: 'g5_toan_b3_on_tap_phan_so',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 3)',
    title: 'Ôn tập phân số & Câu đố thể thao trường Kim Đồng',
    subtitle: 'Rút gọn, quy đồng mẫu số, so sánh phân số và tìm phân số kẹp giữa (trang 11 - 13)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Câu lạc bộ thể thao trường Tiểu học Kim Đồng',
      storyContent:
        'Học sinh khối 5 trường Kim Đồng tham gia 4 môn thể thao: Cầu lông (1/3 số học sinh), Bóng đá (2/5 số học sinh), Võ (1/5 số học sinh) và Bóng rổ (4/15 số học sinh). Thầy Tổng phụ trách muốn biết môn nào có đông học sinh khối 5 tham gia nhất!',
      realWorldContext:
        'Muốn so sánh các phần khác nhau của một tập hợp, ta phải quy đồng các phân số về cùng một mẫu số chung.',
      promptQuestion:
        'Các phân số 1/3, 2/5, 1/5 và 4/15 có mẫu số chung nhỏ nhất là bao nhiêu?',
      keyObservation:
        'Mẫu số chung là 15 vì 15 chia hết cho cả 3, 5 và 15.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Thao Tác Rút Gọn & So Sánh Phân Số',
      instructions:
        'Cùng Kiến Con rút gọn phân số về tối giản và so sánh các phân số trích từ SGK trang 11 - 13.',
      hintStage1: 'Rút gọn phân số bằng cách chia cả tử và mẫu cho ước chung lớn nhất.',
      hintStage2: 'Để so sánh 3/8 và 4/7, hãy quy đồng mẫu số chung là 56: 3/8 = 21/56; 4/7 = 32/56.',
      mathTasks: [
        {
          id: 'b3_task1',
          title: 'Bài 1: Phân số tối giản (SGK trang 11)',
          prompt: 'Trong các phân số sau, phân số nào là phân số tối giản?\nA. 16/18    B. 15/12    C. 7/9    D. 25/30',
          type: 'multiple_choice',
          options: [
            { id: 'opt_c', text: '7/9', isCorrect: true },
            { id: 'opt_a', text: '16/18', isCorrect: false },
            { id: 'opt_b', text: '15/12', isCorrect: false },
            { id: 'opt_d', text: '25/30', isCorrect: false },
          ],
          socraticClue: 'Phân số tối giản là phân số có tử số và mẫu số không cùng chia hết cho số tự nhiên nào lớn hơn 1.',
          explanation: 'Chính xác! 7 và 9 chỉ có ước chung là 1.',
        },
        {
          id: 'b3_task2',
          title: 'Bài 2: Rút gọn phân số 72/90 (SGK trang 11)',
          prompt: 'Rút gọn phân số 72/90 về phân số tối giản:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_4_5', text: '4/5', isCorrect: true },
            { id: 'opt_8_10', text: '8/10', isCorrect: false },
            { id: 'opt_36_45', text: '36/45', isCorrect: false },
          ],
          socraticClue: 'Cùng chia cả tử và mẫu cho 18: 72 : 18 = 4, 90 : 18 = 5.',
          explanation: 'Đúng rồi! 72/90 = 4/5.',
        },
        {
          id: 'b3_task3',
          title: 'Bài 3: Đố em số thích hợp (SGK trang 13)',
          prompt: 'Tìm chữ số thích hợp thay cho dấu ? để: \n3/8 < ?/8 < 4/7',
          type: 'number_input',
          correctAnswer: '4',
          acceptableAnswers: ['4'],
          socraticClue: 'Quy đồng mẫu số 56: 3/8 = 21/56. 4/7 = 32/56. Số ?/8 = (? × 7)/56. Vậy 21 < ? × 7 < 32. Số nào nhân 7 nằm giữa 21 và 32?',
          explanation: 'Xuất sắc! Vì 4 × 7 = 28, mà 21 < 28 < 32, nên ? = 4 (tức 4/8 = 1/2).',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Bài toán CLB thể thao Kim Đồng (SGK trang 13)',
      situation:
        'Cầu lông: 1/3 = 5/15. Bóng đá: 2/5 = 6/15. Võ: 1/5 = 3/15. Bóng rổ: 4/15.',
      question: 'Môn thể thao nào được học sinh khối 5 tham gia nhiều nhất?',
      options: [
        {
          id: 'opt_fb',
          title: 'Môn Bóng đá (2/5 số học sinh)',
          description: 'Vì 2/5 = 6/15, lớn hơn 5/15 (Cầu lông), 4/15 (Bóng rổ) và 3/15 (Võ).',
          isOptimal: true,
          scientificReason: 'Chính xác! 6/15 là phân số lớn nhất trong các phân số đã cho.',
        },
        {
          id: 'opt_badminton',
          title: 'Môn Cầu lông (1/3 số học sinh)',
          description: '1/3 = 5/15.',
          isOptimal: false,
          scientificReason: '5/15 vẫn bé hơn 6/15 của môn Bóng đá.',
        },
      ],
      hintStage1: 'Đưa tất cả 4 phân số về mẫu số chung 15 để so sánh tử số.',
      hintStage2: 'So sánh: 6/15 (Bóng đá) > 5/15 (Cầu lông) > 4/15 (Bóng rổ) > 3/15 (Võ).',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Quy đồng mẫu số',
      guidingQuestion:
        'Tại sao khi hai phân số khác mẫu số, ta không thể so sánh ngay tử số của chúng mà phải quy đồng mẫu số trước?',
      helperBulletPoints: [
        'Mỗi "phần" của hai phân số có kích thước khác nhau thế nào',
        'Ý nghĩa của việc đưa về cùng mẫu số (cùng chia thành các phần bằng nhau)',
        'Liên hệ hình ảnh cắt bánh',
      ],
      sampleStarters: [
        'Kiến ơi, nếu một chiếc bánh chia 3 phần còn chiếc kia chia 5 phần thì...',
        'Quy đồng mẫu số giúp các miếng bánh có kích thước...',
      ],
      expectedConcepts: ['mẫu số chung', 'kích thước phần chia', 'so sánh công bằng'],
    },
  },

  {
    id: 'g5_toan_b4_phan_so_thap_phan',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 4)',
    title: 'Phân số thập phân & Tia số diệu kỳ',
    subtitle: 'Nhận biết phân số có mẫu là 10, 100, 1000... và chuyển phân số thường thành phân số thập phân (trang 14, 15)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Thước đo thập phân của kiến thợ',
      storyContent:
        'Kiến Con chế tạo một chiếc thước kẻ đặc biệt chia đều mỗi mét thành 10 phần, 100 phần rồi 1 000 phần bằng nhau. Các bạn kiến nhận thấy những phân số có mẫu số là 10, 100, 1 000 rất dễ tính toán và là cây cầu nối trực tiếp đến SỐ THẬP PHÂN!',
      realWorldContext:
        'Trong khoa học và đời sống, hệ đo lường thập phân (mét, gam, lít) đều dựa trên các bước chia 10, 100, 1 000.',
      promptQuestion:
        'Những phân số như 3/10, 57/100, 351/1000 có điểm gì chung ở mẫu số?',
      keyObservation:
        'Các phân số có mẫu số là 10; 100; 1 000;... được gọi là PHÂN SỐ THẬP PHÂN.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Chuyển Đổi Phân Số Thập Phân',
      instructions:
        'Biến đổi các phân số thành phân số thập phân bằng cách nhân hoặc chia cả tử và mẫu với số thích hợp (SGK trang 15).',
      hintStage1: 'Tìm số nhân với mẫu để ra 10, 100 hoặc 1 000 (ví dụ: 5 x 2 = 10, 25 x 4 = 100, 125 x 8 = 1000).',
      hintStage2: '3/5 = (3 x 2)/(5 x 2) = 6/10.',
      mathTasks: [
        {
          id: 'b4_task1',
          title: 'Bài 1: Nhận diện phân số thập phân (SGK trang 14)',
          prompt: 'Trong các phân số sau, phân số nào KHÔNG PHẢI là phân số thập phân?\n7/10; 63/100; 9/20; 16/1000',
          type: 'multiple_choice',
          options: [
            { id: 'opt_9_20', text: '9/20', isCorrect: true },
            { id: 'opt_7_10', text: '7/10', isCorrect: false },
            { id: 'opt_63_100', text: '63/100', isCorrect: false },
            { id: 'opt_16_1000', text: '16/1000', isCorrect: false },
          ],
          socraticClue: 'Mẫu số của phân số thập phân phải là 10, 100, 1 000, 10 000... Số 20 không phải.',
          explanation: 'Chính xác! 9/20 có mẫu số là 20 nên chưa phải là phân số thập phân.',
        },
        {
          id: 'b4_task2',
          title: 'Bài 2: Đổi 11/25 thành phân số thập phân (SGK trang 15)',
          prompt: 'Điền số thích hợp vào dấu ?: \n11/25 = (11 × ?) / (25 × 4) = ? / 100',
          type: 'number_input',
          correctAnswer: '44',
          acceptableAnswers: ['44'],
          socraticClue: '11 × 4 = 44.',
          explanation: 'Tuyệt vời! 11/25 = 44/100.',
        },
        {
          id: 'b4_task3',
          title: 'Bài 3: Đổi 31/125 thành phân số thập phân (SGK trang 15)',
          prompt: 'Chuyển phân số 31/125 thành phân số thập phân có mẫu số là 1 000. Tử số mới là bao nhiêu?',
          type: 'number_input',
          correctAnswer: '248',
          acceptableAnswers: ['248'],
          socraticClue: '1 000 : 125 = 8. Lấy cả tử và mẫu nhân với 8: 31 × 8 = ?',
          explanation: 'Chính xác! 31 × 8 = 248, vậy 31/125 = 248/1 000.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Vận dụng: Đổi 66/60 thành phân số thập phân (SGK trang 15)',
      situation:
        'Kiến Con muốn chuyển phân số 66/60 thành phân số thập phân. Kiến đang phân vân nên nhân lên hay chia bớt cả tử và mẫu.',
      question: 'Cách biến đổi nào nhanh và chuẩn nhất?',
      options: [
        {
          id: 'opt_div6',
          title: 'Cùng chia cả tử và mẫu cho 6 để được 11/10',
          description: '66 : 6 = 11 và 60 : 6 = 10, mẫu số ra ngay 10.',
          isOptimal: true,
          scientificReason: 'Chính xác! Rút gọn chia cho 6 đưa thẳng về mẫu số 10 rất gọn gàng.',
        },
        {
          id: 'opt_mul',
          title: 'Nhân cả tử và mẫu với 100',
          description: 'Để mẫu thành 6 000.',
          isOptimal: false,
          scientificReason: 'Mẫu số 6 000 không phải là 10, 100 hay 1 000 nên không tạo ra phân số thập phân.',
        },
      ],
      hintStage1: 'Quan sát mẫu số 60: nếu chia cho 6 thì 60 : 6 = 10.',
      hintStage2: 'Kiểm tra tử số: 66 có chia hết cho 6 không? Có, 66 : 6 = 11.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Phân số thập phân',
      guidingQuestion:
        'Bạn hãy giải thích cho Kiến Con: "Làm thế nào để nhận biết một phân số là phân số thập phân chỉ trong 1 giây?"',
      helperBulletPoints: [
        'Nhìn vào tử số hay mẫu số?',
        'Các số 10, 100, 1 000, 10 000 có đặc điểm gì',
        'Phân biệt phân số thập phân với số thập phân',
      ],
      sampleStarters: [
        'Kiến chỉ cần nhìn ngay vào mẫu số: nếu mẫu số là 1 kèm theo các chữ số 0...',
        'Ví dụ 7/10 hay 126/100 đều là phân số thập phân vì mẫu số...',
      ],
      expectedConcepts: ['mẫu số là 10, 100, 1000', 'hệ thập phân'],
    },
  },

  {
    id: 'g5_toan_b5_phep_tinh_phan_so',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 5)',
    title: 'Ôn tập phép tính phân số & Dây đèn trang trí 18m',
    subtitle: 'Thành thạo cộng, trừ, nhân, chia phân số và giải bài toán tấm kính mặt bàn (trang 16 - 19)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Tấm biển quảng cáo hình vuông viền đèn LED 18m',
      storyContent:
        'Để chuẩn bị hội chợ hoa mùa xuân, Kiến Con trang trí một tấm biển quảng cáo dạng hình vuông. Người ta gắn các dây đèn LED một vòng xung quanh mép tấm biển. Tổng độ dài dây đèn đúng bằng 18 m!',
      realWorldContext:
        'Chu vi hình vuông = cạnh × 4. Muốn tìm cạnh, ta lấy chu vi chia cho 4. Diện tích = cạnh × cạnh.',
      promptQuestion:
        'Nếu chu vi là 18 m, thì cạnh của tấm biển hình vuông là bao nhiêu mét (viết dưới dạng phân số tối giản)?',
      keyObservation:
        'Cạnh = 18 : 4 = 18/4 = 9/2 m.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Tính Toán Phân Số Thần Tốc',
      instructions:
        'Tính toán giá trị các biểu thức và áp dụng tính thuận tiện rút gọn chéo từ SGK trang 16 - 19.',
      hintStage1: 'Khi nhân phân số: Tử nhân tử, mẫu nhân mẫu. Khi chia phân số: Nhân với phân số đảo ngược.',
      hintStage2: 'Tính thuận tiện: (10/11 × 11/10) × (9/16 × 8/9) = 1 × 1/2 = 1/2.',
      mathTasks: [
        {
          id: 'b5_task1',
          title: 'Bài 1: Tính diện tích tấm biển quảng cáo (SGK trang 17)',
          prompt: 'Tấm biển hình vuông có cạnh là 9/2 m. Diện tích tấm biển đó là bao nhiêu mét vuông?',
          type: 'multiple_choice',
          options: [
            { id: 'opt_81_4', text: '81/4 m²', isCorrect: true },
            { id: 'opt_18_4', text: '18/4 m²', isCorrect: false },
            { id: 'opt_9_4', text: '9/4 m²', isCorrect: false },
            { id: 'opt_81_2', text: '81/2 m²', isCorrect: false },
          ],
          socraticClue: 'Diện tích hình vuông = cạnh × cạnh = 9/2 × 9/2.',
          explanation: 'Chính xác! 9/2 × 9/2 = 81/4 m².',
        },
        {
          id: 'b5_task2',
          title: 'Bài 2: Tính thuận tiện phân số triệt tiêu (SGK trang 18)',
          prompt: 'Tính thuận tiện: \n(10/11) × (9/16) × (11/10) × (8/9)',
          type: 'multiple_choice',
          options: [
            { id: 'opt_half', text: '1/2', isCorrect: true },
            { id: 'opt_one', text: '1', isCorrect: false },
            { id: 'opt_quarter', text: '1/4', isCorrect: false },
          ],
          socraticClue: 'Nhóm (10/11 × 11/10 = 1) và (9/16 × 8/9 = 8/16 = 1/2).',
          explanation: 'Xuất sắc! 1 × 1/2 = 1/2.',
        },
        {
          id: 'b5_task3',
          title: 'Bài 3: Cắt mặt bàn kính (SGK trang 18)',
          prompt: 'Tấm kính hình chữ nhật có chiều dài 5/2 m, chiều rộng 4/3 m. Chú Hoà chia tấm kính thành 3 phần bằng nhau làm mặt bàn. Diện tích mỗi mặt bàn là bao nhiêu mét vuông?',
          type: 'multiple_choice',
          options: [
            { id: 'opt_10_9', text: '10/9 m²', isCorrect: true },
            { id: 'opt_20_6', text: '20/6 m²', isCorrect: false },
            { id: 'opt_5_6', text: '5/6 m²', isCorrect: false },
          ],
          socraticClue: 'Diện tích cả tấm kính = 5/2 × 4/3 = 20/6 = 10/3 m². Chia làm 3 phần: 10/3 : 3 = 10/9 m².',
          explanation: 'Tuyệt vời! 10/3 : 3 = 10/9 m².',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Câu đố đo băng giấy của Mai (SGK trang 19)',
      situation:
        'Nam hỏi Mai: "Từ băng giấy dài 2/3 m, làm thế nào lấy được đoạn băng giấy dài 1/2 m mà KHÔNG DÙNG THƯỚC ĐO?"',
      question: 'Bạn hãy giúp Mai tìm cách gấp băng giấy thông minh nhất!',
      options: [
        {
          id: 'opt_fold4',
          title: 'Gấp băng giấy làm 4 phần bằng nhau, rồi cắt lấy 3 phần',
          description: 'Vì 2/3 : 4 = 2/12 = 1/6 m. Khi lấy 3 phần: 1/6 × 3 = 3/6 = 1/2 m!',
          isOptimal: true,
          scientificReason: 'Tư duy toán học xuất sắc! (2/3) × (3/4) = 1/2 m chuẩn xác tuyệt đối không cần thước kẻ.',
        },
        {
          id: 'opt_eye',
          title: 'Ước lượng bằng mắt rồi cắt',
          description: 'Nhìn áng chừng hơn một nửa một chút rồi cắt.',
          isOptimal: false,
          scientificReason: 'Ước lượng bằng mắt sẽ bị sai lệch kích thước, không khoa học.',
        },
      ],
      hintStage1: 'Nhận xét: (1/2) : (2/3) = 1/2 × 3/2 = 3/4.',
      hintStage2: 'Đoạn 1/2 m chiếm đúng 3/4 của băng giấy dài 2/3 m!',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Phép chia phân số',
      guidingQuestion:
        'Tại sao khi chia một phân số cho một phân số, ta lại nhân với phân số đảo ngược?',
      helperBulletPoints: [
        'Phép chia là phép tính ngược của phép nhân',
        'Ý nghĩa của phân số nghịch đảo (tích bằng 1)',
        'Ví dụ với 1/2 : 1/4 = 2 (trong một nửa có mấy cái một phần tư)',
      ],
      sampleStarters: [
        'Kiến ơi, ví dụ khi hỏi "trong nửa cái bánh có bao nhiêu miếng 1/4", ta thấy ngay là có 2 miếng...',
        'Phép chia cho phân số được chuyển thành nhân đảo ngược vì...',
      ],
      expectedConcepts: ['phân số đảo ngược', 'phép tính ngược', 'chia đều'],
    },
  },

  {
    id: 'g5_toan_b7_hon_so',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 1: Ôn tập & Bổ sung (Bài 7)',
    title: 'Hỗn số & Bí quyết chia kẹo của cô Dung',
    subtitle: 'Khám phá cấu tạo phần nguyên, phần phân số và chuyển đổi hỗn số sang phân số thập phân (trang 23 - 25)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 160,
    discover: {
      storyTitle: 'Chia 5 cái bánh cho 4 bạn kiến',
      storyContent:
        'Kiến Con có 5 chiếc bánh nướng thơm lừng muốn chia đều cho 4 bạn kiến thợ. Mỗi bạn nhận được 1 chiếc bánh nguyên vẹn, và chiếc bánh thứ 5 được cắt làm 4 phần bằng nhau để mỗi bạn lấy thêm 1/4 chiếc bánh. Ta viết gọn là 1 1/4 (Một và một phần tư)!',
      realWorldContext:
        'Hỗn số giúp ta biểu thị các đại lượng lớn hơn 1 một cách trực quan: 1 giờ rưỡi là 1 1/2 giờ, 2 mét rưỡi là 2 1/2 mét.',
      promptQuestion:
        'Trong hỗn số 2 3/10, phần nguyên là mấy và phần phân số là mấy?',
      keyObservation:
        'Phần nguyên là 2, phần phân số là 3/10 (phần phân số luôn bé hơn 1).',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Chuyển Đổi Hỗn Số Thần Kỳ',
      instructions:
        'Chuyển đổi hỗn số thành phân số thập phân và ngược lại theo mẫu SGK trang 24 - 25.',
      hintStage1: 'Quy tắc chuyển hỗn số thành phân số: Tử số = (Phần nguyên × Mẫu số) + Tử số phần phân số. Mẫu số giữ nguyên.',
      hintStage2: '2 7/10 = (2 × 10 + 7) / 10 = 27/10.',
      mathTasks: [
        {
          id: 'b7_task1',
          title: 'Bài 1: Chuyển hỗn số thành phân số thập phân (SGK trang 24)',
          prompt: 'Chuyển hỗn số 5 1/10 thành phân số thập phân:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_51_10', text: '51/10', isCorrect: true },
            { id: 'opt_15_10', text: '15/10', isCorrect: false },
            { id: 'opt_50_10', text: '50/10', isCorrect: false },
          ],
          socraticClue: 'Tử số = 5 × 10 + 1 = 51. Mẫu số = 10.',
          explanation: 'Chính xác! 5 1/10 = 51/10.',
        },
        {
          id: 'b7_task2',
          title: 'Bài 2: Chuyển 1 9/100 thành phân số thập phân (SGK trang 24)',
          prompt: 'Hỗn số 1 9/100 chuyển thành phân số thập phân có tử số là bao nhiêu?',
          type: 'number_input',
          correctAnswer: '109',
          acceptableAnswers: ['109'],
          socraticClue: 'Tử số = 1 × 100 + 9 = 109.',
          explanation: 'Tuyệt vời! 1 9/100 = 109/100.',
        },
        {
          id: 'b7_task3',
          title: 'Bài 3: Chuyển phân số thành hỗn số (SGK trang 25)',
          prompt: 'Phân số 57/10 chuyển thành hỗn số là:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_5_7_10', text: '5 7/10', isCorrect: true },
            { id: 'opt_7_5_10', text: '7 5/10', isCorrect: false },
            { id: 'opt_50_7_10', text: '50 7/10', isCorrect: false },
          ],
          socraticClue: '57 : 10 = 5 (dư 7). Thương là phần nguyên (5), số dư là tử số (7), mẫu số giữ nguyên (10).',
          explanation: 'Đúng rồi! 57/10 = 5 7/10.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Bài toán chia kẹo của cô Dung (SGK trang 25)',
      situation:
        'Cô Dung có 23 phong kẹo, mỗi phong có 10 viên kẹo. Cô chia đều số kẹo đó cho 10 bạn học sinh.',
      question: 'Khẳng định nào dưới đây là KHẲNG ĐỊNH SAI?',
      options: [
        {
          id: 'opt_wrong',
          title: 'Khẳng định sai: Mỗi bạn nhận được 2 3/10 viên kẹo',
          description: 'Tổng có 23 × 10 = 230 viên kẹo, chia cho 10 bạn thì mỗi bạn nhận 23 viên kẹo, không phải 2 3/10 viên kẹo!',
          isOptimal: true,
          scientificReason: 'Chính xác! 2 3/10 là số PHONG kẹo (2 phong và 3/10 phong), không phải viên kẹo.',
        },
        {
          id: 'opt_true_a',
          title: 'Mỗi bạn nhận được 23 viên kẹo',
          description: '230 : 10 = 23 viên kẹo (đây là câu đúng).',
          isOptimal: false,
          scientificReason: 'Đề bài yêu cầu tìm câu SAI, còn câu này là đúng.',
        },
      ],
      hintStage1: 'Phân biệt đơn vị "phong kẹo" và "viên kẹo".',
      hintStage2: '23 phong chia cho 10 bạn thì mỗi bạn được 23/10 = 2 3/10 phong kẹo (tức 23 viên kẹo).',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Cấu tạo hỗn số',
      guidingQuestion:
        'Hỗn số gồm có mấy phần? Tại sao phần phân số của hỗn số luôn phải bé hơn 1?',
      helperBulletPoints: [
        'Phần nguyên và phần phân số',
        'Nếu phần phân số lớn hơn hoặc bằng 1 thì ta làm gì?',
        'Cách đọc hỗn số rõ ràng',
      ],
      sampleStarters: [
        'Kiến ơi, hỗn số gồm 2 phần: phần nguyên đứng trước và phần phân số đứng sau...',
        'Phần phân số luôn bé hơn 1 vì nếu nó đủ 1 thì ta đã gộp vào phần nguyên rồi...',
      ],
      expectedConcepts: ['phần nguyên', 'phần phân số', 'bé hơn 1'],
    },
  },

  // ==========================================
  // CHỦ ĐỀ 2: SỐ THẬP PHÂN
  // ==========================================
  {
    id: 'g5_toan_b10_khai_niem_so_thap_phan',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 2: Số thập phân (Bài 10)',
    title: 'Khái niệm số thập phân & Các hàng thập phân',
    subtitle: 'Cấu tạo phần nguyên - phần thập phân, hàng phần mười, trăm, nghìn và bài toán 4 tấm thẻ (trang 32 - 37)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 170,
    discover: {
      storyTitle: 'Chiếc xà đơn thể dục và số đo thập phân',
      storyContent:
        'Trong giờ thể dục, Kiến Con đo chiều cao của chiếc xà đơn trường học được 165 cm. Thầy giáo yêu cầu ghi số đo bằng đơn vị mét. Kiến Con nhớ lại: 165 cm = 165/100 m = 1 65/100 m = 1,65 m (Một phẩy sáu mươi lăm mét)!',
      realWorldContext:
        'Số thập phân dùng để ghi chép tiền bạc (12,5 nghìn đồng), chiều cao cơ thể (1,45 m), cân nặng (32,5 kg) và nhiệt độ thời tiết (36,5°C).',
      promptQuestion:
        'Số 1,65 gồm mấy phần và được ngăn cách bởi dấu gì?',
      keyObservation:
        'Mỗi số thập phân gồm phần nguyên (bên trái dấu phẩy) và phần thập phân (bên phải dấu phẩy).',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Xếp Chữ Số Vào Các Hàng Thập Phân',
      instructions:
        'Xác định hàng của các chữ số và chuyển đổi phân số thập phân thành số thập phân theo SGK trang 35 - 37.',
      hintStage1: 'Bên phải dấu phẩy: Hàng phần mười -> Hàng phần trăm -> Hàng phần nghìn.',
      hintStage2: '325,431 có: 4 ở hàng phần mười, 3 ở hàng phần trăm, 1 ở hàng phần nghìn.',
      mathTasks: [
        {
          id: 'b10_task1',
          title: 'Bài 1: Viết số thập phân (SGK trang 36)',
          prompt: 'Số thập phân gồm: 3 chục, 5 đơn vị, 6 phần mười, 2 phần trăm, 4 phần nghìn viết là:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_35_624', text: '35,624', isCorrect: true },
            { id: 'opt_35_264', text: '35,264', isCorrect: false },
            { id: 'opt_356_24', text: '356,24', isCorrect: false },
          ],
          socraticClue: 'Phần nguyên là 35. Phần thập phân là 624.',
          explanation: 'Chính xác! Viết là 35,624.',
        },
        {
          id: 'b10_task2',
          title: 'Bài 2: Chuyển phân số thập phân thành số thập phân (SGK trang 36)',
          prompt: 'Phân số 236/100 viết dưới dạng số thập phân là:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_2_36', text: '2,36', isCorrect: true },
            { id: 'opt_23_6', text: '23,6', isCorrect: false },
            { id: 'opt_0_236', text: '0,236', isCorrect: false },
          ],
          socraticClue: 'Mẫu số có hai chữ số 0 (100) thì phần thập phân có 2 chữ số: 2,36.',
          explanation: 'Tuyệt vời! 236/100 = 2,36.',
        },
        {
          id: 'b10_task3',
          title: 'Bài 3: Đọc vị trí hàng (SGK trang 36)',
          prompt: 'Trong số thập phân 49,251, chữ số 5 nằm ở hàng nào?',
          type: 'multiple_choice',
          options: [
            { id: 'opt_pt', text: 'Hàng phần trăm', isCorrect: true },
            { id: 'opt_pm', text: 'Hàng phần mười', isCorrect: false },
            { id: 'opt_pn', text: 'Hàng phần nghìn', isCorrect: false },
          ],
          socraticClue: 'Sau dấu phẩy là 2 (hàng phần mười), rồi đến 5 (hàng phần trăm).',
          explanation: 'Chính xác! 5 đứng ở hàng thứ hai sau dấu phẩy nên thuộc hàng phần trăm.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Thử thách 4 tấm thẻ số (SGK trang 37)',
      situation:
        'Từ bốn tấm thẻ: [7], [,], [0], [2], Rô-bốt muốn lập tất cả các số thập phân có phần nguyên gồm một chữ số và phần thập phân gồm hai chữ số.',
      question: 'Có bao nhiêu số thập phân thỏa mãn yêu cầu đề bài?',
      options: [
        {
          id: 'opt_6',
          title: 'Có tất cả 6 số: 0,27; 0,72; 2,07; 2,70; 7,02; 7,20',
          description: 'Mỗi chữ số 0, 2, 7 lần lượt đứng ở phần nguyên, 2 chữ số còn lại hoán vị ở phần thập phân (3 × 2 = 6 số).',
          isOptimal: true,
          scientificReason: 'Tư duy logic tổ hợp rất chặt chẽ và không bỏ sót số nào!',
        },
        {
          id: 'opt_4',
          title: 'Chỉ có 4 số vì không thể để chữ số 0 ở phần nguyên',
          description: '0,27 không được tính.',
          isOptimal: false,
          scientificReason: 'Số thập phân hoàn toàn có thể có chữ số 0 ở phần nguyên (ví dụ 0,27; 0,72)!',
        },
      ],
      hintStage1: 'Chọn chữ số phần nguyên: có 3 cách chọn (0, 2 hoặc 7).',
      hintStage2: 'Với mỗi phần nguyên, còn 2 chữ số xếp vào hàng phần mười và phần trăm (2 cách). Vậy có 3 × 2 = 6 số.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Hàng của số thập phân',
      guidingQuestion:
        'Bạn hãy giải thích cho Kiến Con: "Tại sao số 0,4 và số 0,04 lại có giá trị khác nhau rất nhiều dù đều có chữ số 4?"',
      helperBulletPoints: [
        'Vị trí của chữ số 4 ở hàng phần mười hay hàng phần trăm',
        'So sánh 4/10 với 4/100',
        'Hình ảnh trực quan (4 thanh sô-cô-la so với 4 mẩu nhỏ)',
      ],
      sampleStarters: [
        'Kiến ơi, ở số 0,4, chữ số 4 đứng ngay sau dấu phẩy nghĩa là 4 phần mười...',
        'Còn ở số 0,04, chữ số 4 đứng ở hàng phần trăm nên nó chỉ bằng 4/100...',
      ],
      expectedConcepts: ['hàng phần mười', 'hàng phần trăm', 'giá trị gấp 10 lần'],
    },
  },

  {
    id: 'g5_toan_b11_so_sanh_so_thap_phan',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 2: Số thập phân (Bài 11)',
    title: 'So sánh số thập phân & Câu đố ba chiếc cân đĩa',
    subtitle: 'Quy tắc so sánh từ phần nguyên đến phần thập phân, số thập phân bằng nhau và bỏ/thêm số 0 (trang 38 - 41)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 170,
    discover: {
      storyTitle: 'Ba chiếc cân đĩa trong gian hàng hoa quả',
      storyContent:
        'Tại hội chợ mùa thu, các bạn kiến kiểm tra 3 chiếc cân đĩa:\n- Cân 1: Mèo 2,75 kg nghiêng thấp hơn Gà 2,54 kg.\n- Cân 2: Quả sầu riêng 3,05 kg cân bằng với quả mít 3,05 kg.\n- Cân 3: Bao gạo 2,57 kg lại bị vẽ thấp hơn rổ gạo 2,75 kg!\nKiến Con thắc mắc chiếc cân nào đã bị cân sai quy luật trọng lượng?',
      realWorldContext:
        'So sánh số thập phân giúp so sánh giá cả mặt hàng, thời gian chạy đua trong thể thao (9,58 giây của Usain Bolt) và nồng độ dung dịch.',
      promptQuestion:
        'Khi so sánh hai số thập phân, ta so sánh phần nào trước tiên?',
      keyObservation:
        'So sánh phần nguyên trước: Số nào có phần nguyên lớn hơn thì lớn hơn. Nếu bằng nhau mới so sánh từng hàng ở phần thập phân.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Thử Thách So Sánh & Thêm Bớt Số 0',
      instructions:
        'So sánh các cặp số thập phân và rút gọn bằng cách bỏ chữ số 0 tận cùng (SGK trang 39 - 41).',
      hintStage1: 'Viết thêm (hoặc bỏ) chữ số 0 tận cùng bên phải phần thập phân thì giá trị của số thập phân KHÔNG ĐỔI.',
      hintStage2: '13,7 = 13,70 = 13,700.',
      mathTasks: [
        {
          id: 'b11_task1',
          title: 'Bài 1: So sánh hai số thập phân (SGK trang 39)',
          prompt: 'Điền dấu thích hợp: 37,29 [ ? ] 36,92',
          type: 'multiple_choice',
          options: [
            { id: 'opt_gt', text: '>', isCorrect: true },
            { id: 'opt_lt', text: '<', isCorrect: false },
            { id: 'opt_eq', text: '=', isCorrect: false },
          ],
          socraticClue: 'So sánh phần nguyên: 37 > 36.',
          explanation: 'Chính xác! Phần nguyên 37 > 36 nên 37,29 > 36,92.',
        },
        {
          id: 'b11_task2',
          title: 'Bài 2: Rút gọn số thập phân (SGK trang 40)',
          prompt: 'Bỏ các chữ số 0 tận cùng ở phần thập phân để thu gọn số 13,0500:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_13_05', text: '13,05', isCorrect: true },
            { id: 'opt_13_5', text: '13,5', isCorrect: false },
            { id: 'opt_1305', text: '1305', isCorrect: false },
          ],
          socraticClue: 'Chỉ được bỏ các chữ số 0 ở TẬN CÙNG bên phải. Chữ số 0 giữa dấu phẩy và 5 không được bỏ!',
          explanation: 'Rất chuẩn! 13,0500 = 13,05.',
        },
        {
          id: 'b11_task3',
          title: 'Bài 3: Chú mèo câu cá (SGK trang 41)',
          prompt: 'Chú mèo câu được con cá ghi số thập phân lớn hơn 1,036 và bé hơn 2. Con cá đó ghi số nào?\nA. 0,95    B. 1,36    C. 2,01    D. 1,036',
          type: 'multiple_choice',
          options: [
            { id: 'opt_1_36', text: '1,36', isCorrect: true },
            { id: 'opt_0_95', text: '0,95', isCorrect: false },
            { id: 'opt_2_01', text: '2,01', isCorrect: false },
            { id: 'opt_1_036', text: '1,036', isCorrect: false },
          ],
          socraticClue: '1,036 < 1,36 < 2.',
          explanation: 'Xuất sắc! 1,36 nằm giữa 1,036 và 2.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Giải mã chiếc cân đĩa bị sai (SGK trang 39)',
      situation:
        'Cân 1: Mèo (2,75 kg) nặng hơn Gà (2,54 kg) -> Đúng.\nCân 2: Sầu riêng (3,05 kg) bằng Mít (3,05 kg) -> Đúng.\nCân 3: Bao gạo (2,57 kg) và Rổ gạo (2,75 kg).',
      question: 'Tại sao chiếc cân số 3 lại bị vẽ SAI?',
      options: [
        {
          id: 'opt_c3_wrong',
          title: 'Vì 2,57 kg bé hơn 2,75 kg nhưng lại bị vẽ chìm thấp hơn',
          description: 'Hàng phần mười của 2,57 là 5, bé hơn hàng phần mười của 2,75 là 7. Đáng lẽ rổ gạo 2,75 kg phải nặng hơn và chìm thấp xuống.',
          isOptimal: true,
          scientificReason: 'Chính xác! 2,57 < 2,75 nên bao gạo nhẹ hơn, không thể làm đĩa cân hạ thấp hơn rổ gạo.',
        },
        {
          id: 'opt_c3_ok',
          title: 'Chiếc cân số 3 không sai, do góc nhìn',
          description: 'Hai bên gần bằng nhau.',
          isOptimal: false,
          scientificReason: 'Trong toán học, 2,75 kg nặng hơn 2,57 kg rõ ràng (hơn 0,18 kg).',
        },
      ],
      hintStage1: 'Vật nặng hơn sẽ kéo đĩa cân chìm xuống thấp hơn.',
      hintStage2: 'So sánh 2,57 và 2,75: Số nào lớn hơn?',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Số thập phân bằng nhau',
      guidingQuestion:
        'Tại sao khi viết thêm chữ số 0 vào bên phải số tự nhiên thì số đó gấp lên 10 lần (ví dụ 5 thành 50), nhưng khi viết thêm số 0 vào tận cùng số thập phân thì giá trị lại KHÔNG ĐỔI (ví dụ 0,5 = 0,50)?',
      helperBulletPoints: [
        'Vị trí của các hàng có bị thay đổi không?',
        '0,5 là 5/10; 0,50 là 50/100 (50/100 rút gọn có bằng 5/10 không?)',
        'Quy tắc thêm hoặc bớt chữ số 0',
      ],
      sampleStarters: [
        'Kiến ơi, ở số thập phân, khi thêm số 0 vào tận cùng bên phải, chữ số 5 vẫn ở hàng phần mười...',
        'Phân số 5/10 bằng đúng 50/100 nên giá trị của 0,5 và 0,50 hoàn toàn...',
      ],
      expectedConcepts: ['không đổi vị trí hàng', '5/10 = 50/100', 'số thập phân bằng nhau'],
    },
  },

  {
    id: 'g5_toan_b13_lam_tron_so_thap_phan',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 2: Số thập phân (Bài 13)',
    title: 'Làm tròn số thập phân & Màn hình TV 55 inch',
    subtitle: 'Làm tròn đến số tự nhiên, hàng phần mười, hàng phần trăm và ứng dụng số đo chuẩn WHO (trang 47 - 50)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 170,
    discover: {
      storyTitle: 'Đường chéo chiếc ti vi 55 inch',
      storyContent:
        'Việt và Nam cùng đọc thông số kĩ thuật của chiếc tivi thông minh 55 inch: Đường chéo màn hình đo được chính xác là 139,7 cm. Việt nói: "Đường chéo tivi dài khoảng 139 cm". Nam nói: "Đường chéo tivi dài khoảng 140 cm". Bạn nào đã làm tròn đúng quy tắc toán học?',
      realWorldContext:
        'Trong thực tế, khi nói về quãng đường (12,8 km khoảng 13 km), giá tiền hay chiều cao chuẩn, chúng ta thường làm tròn để dễ ghi nhớ và ước lượng.',
      promptQuestion:
        'Chữ số ở hàng phần mười của 139,7 là chữ số 7 (lớn hơn 5). Vậy ta làm tròn lên hay làm tròn xuống?',
      keyObservation:
        'Nếu chữ số ngay sau hàng làm tròn từ 5 trở lên thì cộng thêm 1 vào hàng làm tròn. 139,7 làm tròn đến hàng đơn vị là 140!',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Làm Tròn Số Thập Phân',
      instructions:
        'Thực hành làm tròn đến số tự nhiên, hàng phần mười và hàng phần trăm theo SGK trang 48 - 50.',
      hintStage1: 'Quan sát chữ số đứng ngay sau hàng cần làm tròn: Nếu < 5 thì giữ nguyên; nếu >= 5 thì tăng thêm 1.',
      hintStage2: 'Số Pi = 3,14159... Làm tròn đến hàng phần trăm (sau số 4 là 1 < 5) => 3,14.',
      mathTasks: [
        {
          id: 'b13_task1',
          title: 'Bài 1: Làm tròn đến số tự nhiên gần nhất (SGK trang 48)',
          prompt: 'Làm tròn số 513,59 đến số tự nhiên gần nhất:',
          type: 'number_input',
          correctAnswer: '514',
          acceptableAnswers: ['514'],
          socraticClue: 'Chữ số hàng phần mười là 5 (>= 5) nên làm tròn lên: 513 + 1 = 514.',
          explanation: 'Chính xác! 513,59 làm tròn thành 514.',
        },
        {
          id: 'b13_task2',
          title: 'Bài 2: Làm tròn đến hàng phần mười (SGK trang 50)',
          prompt: 'Làm tròn số 9,345 đến hàng phần mười:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_9_3', text: '9,3', isCorrect: true },
            { id: 'opt_9_4', text: '9,4', isCorrect: false },
            { id: 'opt_9_35', text: '9,35', isCorrect: false },
          ],
          socraticClue: 'Chữ số ngay sau hàng phần mười là chữ số 4 (hàng phần trăm). Vì 4 < 5 nên giữ nguyên chữ số 3.',
          explanation: 'Tuyệt vời! 9,345 làm tròn đến hàng phần mười là 9,3.',
        },
        {
          id: 'b13_task3',
          title: 'Bài 3: Làm tròn số Pi đến hàng phần trăm (SGK trang 50)',
          prompt: 'Số Pi = 3,141592... Làm tròn số Pi đến hàng phần trăm:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_3_14', text: '3,14', isCorrect: true },
            { id: 'opt_3_15', text: '3,15', isCorrect: false },
            { id: 'opt_3_1', text: '3,1', isCorrect: false },
          ],
          socraticClue: 'Hàng phần trăm là chữ số 4. Ngay sau nó là chữ số 1 (< 5). Giữ nguyên 4.',
          explanation: 'Chính xác! Đó là lý do trong công thức tính chu vi và diện tích hình tròn, chúng ta luôn lấy số Pi xấp xỉ 3,14.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Ai làm tròn đúng đường chéo TV? (SGK trang 50)',
      situation:
        'Đường chéo tivi dài 139,7 cm. Việt nói khoảng 139 cm. Nam nói khoảng 140 cm.',
      question: 'Bạn nào đã làm tròn đến số tự nhiên đúng quy tắc?',
      options: [
        {
          id: 'opt_nam',
          title: 'Bạn Nam đúng: Khoảng 140 cm',
          description: 'Vì chữ số hàng phần mười là 7 (>= 5), ta cộng thêm 1 vào hàng đơn vị: 139 + 1 = 140.',
          isOptimal: true,
          scientificReason: 'Chính xác theo quy tắc làm tròn số của Bộ Giáo dục và chuẩn quốc tế.',
        },
        {
          id: 'opt_viet',
          title: 'Bạn Việt đúng: Khoảng 139 cm',
          description: 'Vì bỏ phần thập phân đi.',
          isOptimal: false,
          scientificReason: 'Bỏ đi mà không xét quy tắc >= 5 sẽ tạo ra sai số lớn (0,7 cm gần 1 cm).',
        },
      ],
      hintStage1: 'Chữ số sau dấu phẩy là 7, so sánh 7 với 5.',
      hintStage2: '7 >= 5 nên làm tròn lên 140.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Mẹo nhớ quy tắc làm tròn',
      guidingQuestion:
        'Làm thế nào để nhớ quy tắc "mốc số 5" khi làm tròn số? Hãy tưởng tượng một chiếc bập bênh hoặc một ngọn đồi.',
      helperBulletPoints: [
        'Dưới 5 (0, 1, 2, 3, 4): Trượt dốc xuống (giữ nguyên)',
        'Từ 5 trở lên (5, 6, 7, 8, 9): Vượt đỉnh đồi sang dốc bên kia (cộng thêm 1)',
        'Ứng dụng khi đi siêu thị thanh toán tiền',
      ],
      sampleStarters: [
        'Kiến hãy tưởng tượng số 5 như đỉnh của ngọn đồi...',
        'Nếu chữ số sau nó từ 5 trở lên thì giống như đã vượt dốc, ta cộng thêm 1 vào...',
      ],
      expectedConcepts: ['mốc số 5', 'làm tròn lên', 'làm tròn xuống', 'giữ nguyên'],
    },
  },

  // ==========================================
  // CHỦ ĐỀ 3: MỘT SỐ ĐƠN VỊ ĐO DIỆN TÍCH
  // ==========================================
  {
    id: 'g5_toan_b15_km2_hectata',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 3: Đơn vị đo diện tích (Bài 15)',
    title: 'Ki-lô-mét vuông & Héc-ta tại Cố đô Huế',
    subtitle: 'Đo lường diện tích lãnh thổ, Vườn quốc gia Bạch Mã và mối liên hệ 1 ha = 10 000 m², 1 km² = 100 ha (trang 53 - 55)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 180,
    discover: {
      storyTitle: 'Chuyến viễn thám Cố đô Huế và Bạch Mã',
      storyContent:
        'Kiến Con đến thăm tỉnh Thừa Thiên Huế và đọc được các số đo diện tích ấn tượng:\n- Tỉnh Thừa Thiên Huế rộng: 5 054 km²\n- Vườn quốc gia Bạch Mã rộng: 22 031 ha\n- Điện Thái Hòa trong Đại Nội rộng: 1 360 m²\nCác bạn kiến thợ vô cùng thích thú khi tìm hiểu đơn vị Héc-ta (ha) và Ki-lô-mét vuông (km²)!',
      realWorldContext:
        'Héc-ta dùng để đo diện tích rừng, nông trường, cánh đồng lúa. Ki-lô-mét vuông dùng để đo diện tích tỉnh, thành phố, quốc gia và đại dương.',
      promptQuestion:
        '1 héc-ta bằng bao nhiêu mét vuông và 1 ki-lô-mét vuông bằng bao nhiêu héc-ta?',
      keyObservation:
        '1 ha = 10 000 m² (hình vuông cạnh 100 m). 1 km² = 100 ha = 1 000 000 m².',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Chuyển Đổi Diện Tích Lãnh Thổ',
      instructions:
        'Thực hành đổi các đơn vị đo diện tích km², ha, m² theo SGK trang 54 - 55.',
      hintStage1: 'Đổi từ km² sang ha: Nhân với 100. Đổi từ ha sang km²: Chia cho 100.',
      hintStage2: 'Khu đất hình vuông cạnh 200 m có diện tích: 200 × 200 = 40 000 m² = 4 ha.',
      mathTasks: [
        {
          id: 'b15_task1',
          title: 'Bài 1: Đổi km² sang ha (SGK trang 55)',
          prompt: 'Điền số thích hợp: 3 km² = [ ? ] ha',
          type: 'number_input',
          correctAnswer: '300',
          acceptableAnswers: ['300'],
          unit: 'ha',
          socraticClue: '1 km² = 100 ha. Lấy 3 × 100.',
          explanation: 'Chính xác! 3 km² = 300 ha.',
        },
        {
          id: 'b15_task2',
          title: 'Bài 2: Đổi ha sang km² (SGK trang 55)',
          prompt: 'Điền số thích hợp: 40 000 ha = [ ? ] km²',
          type: 'number_input',
          correctAnswer: '400',
          acceptableAnswers: ['400'],
          unit: 'km²',
          socraticClue: 'Bớt đi 2 chữ số 0 (chia cho 100): 40 000 : 100 = ?',
          explanation: 'Tuyệt vời! 40 000 ha = 400 km².',
        },
        {
          id: 'b15_task3',
          title: 'Bài 3: Khu đất hình vuông (SGK trang 55)',
          prompt: 'Một khu rừng hình vuông có cạnh dài 200 m. Diện tích khu rừng đó là bao nhiêu héc-ta?',
          type: 'number_input',
          correctAnswer: '4',
          acceptableAnswers: ['4'],
          unit: 'ha',
          socraticClue: 'Diện tích = 200 × 200 = 40 000 m². Đổi sang ha: 40 000 : 10 000 = ?',
          explanation: 'Xuất sắc! 40 000 m² = 4 ha.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'So sánh diện tích ba khu bảo tồn (SGK trang 54)',
      situation:
        'Khu A: Hình chữ nhật 7 km × 3 km = 21 km².\nKhu B: Hình vuông cạnh 5 km = 25 km².\nKhu C: Hình chữ nhật 6 km × 4 km = 24 km².',
      question: 'Khu bảo tồn nào có diện tích lớn nhất?',
      options: [
        {
          id: 'opt_b',
          title: 'Khu B lớn nhất (25 km²)',
          description: 'Diện tích hình vuông: 5 × 5 = 25 km², lớn hơn 24 km² (Khu C) và 21 km² (Khu A).',
          isOptimal: true,
          scientificReason: 'Chính xác! 25 km² > 24 km² > 21 km².',
        },
        {
          id: 'opt_c',
          title: 'Khu C lớn nhất',
          description: '6 × 4 = 24 km².',
          isOptimal: false,
          scientificReason: '24 km² vẫn bé hơn 25 km² của khu B.',
        },
      ],
      hintStage1: 'Tính diện tích từng khu: A = 7 × 3; B = 5 × 5; C = 6 × 4.',
      hintStage2: 'So sánh: 21, 25, 24.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Héc-ta là gì?',
      guidingQuestion:
        'Bạn hãy giải thích cho Kiến Con: "1 héc-ta thực chất là diện tích của một hình vuông có cạnh dài bao nhiêu mét? Tại sao 1 km² lại bằng 100 ha?"',
      helperBulletPoints: [
        '1 ha là diện tích hình vuông cạnh 100 m (100 × 100 = 10 000 m²)',
        '1 km = 1 000 m, nên 1 km² = 1 000 × 1 000 = 1 000 000 m²',
        '1 000 000 : 10 000 = 100 lần',
      ],
      sampleStarters: [
        'Kiến ơi, 1 héc-ta chính là một mảnh đất hình vuông cạnh dài đúng 100 mét...',
        'Vì 1 km² có 1 000 000 m² còn 1 ha có 10 000 m² nên 1 km² gấp đúng 100 lần...',
      ],
      expectedConcepts: ['cạnh 100m', '10 000 m²', 'gấp 100 lần', 'bảng đơn vị đo'],
    },
  },

  // ==========================================
  // CHỦ ĐỀ 4: CÁC PHÉP TÍNH VỚI SỐ THẬP PHÂN
  // ==========================================
  {
    id: 'g5_toan_b19_b23_phep_tinh_so_thap_phan',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 4: Phép tính số thập phân (Bài 19 - 23)',
    title: '4 phép tính số thập phân & Tuyệt chiêu dời dấu phẩy',
    subtitle: 'Cộng, trừ, nhân, chia số thập phân và bí quyết nhân chia nhẩm với 10, 100, 0,1, 0,01 (trang 65 - 87)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 180,
    discover: {
      storyTitle: 'Phép màu dịch chuyển dấu phẩy',
      storyContent:
        'Kiến Nổ khoe với Kiến Con một bí kíp tính nhẩm thần tốc: "Không cần đặt bút tính nháp, khi nhân một số thập phân với 10, 100 ta chỉ cần dời dấu phẩy sang PHẢI. Còn khi nhân với 0,1; 0,01 ta lại dời dấu phẩy sang TRÁI!"',
      realWorldContext:
        'Kỹ năng tính nhẩm số thập phân cực kì quan trọng khi đổi đơn vị đo (từ mét sang xen-ti-mét nhân 100, từ gam sang ki-lô-gam chia 1 000) và tính tiền giảm giá.',
      promptQuestion:
        'Khi nhân 4,75 với 100, dấu phẩy sẽ dịch sang phải mấy chữ số?',
      keyObservation:
        'Số 100 có hai chữ số 0, dấu phẩy dời sang phải 2 chữ số: 4,75 × 100 = 475.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Đấu Trường 4 Phép Tính Số Thập Phân',
      instructions:
        'Thực hiện các phép cộng, trừ, nhân, chia số thập phân và tính thuận tiện theo SGK trang 67, 75, 82, 85.',
      hintStage1: 'Cộng/trừ: Đặt tính thẳng cột dấu phẩy. Nhân: Đếm số chữ số thập phân của cả hai thừa số để tách ở tích.',
      hintStage2: 'Tính thuận tiện: 6 + 8,46 + 1,54 = 6 + (8,46 + 1,54) = 6 + 10 = 16.',
      mathTasks: [
        {
          id: 'b19_task1',
          title: 'Bài 1: Tính thuận tiện phép cộng (SGK trang 67)',
          prompt: 'Tính nhanh: 6 + 8,46 + 1,54',
          type: 'number_input',
          correctAnswer: '16',
          acceptableAnswers: ['16'],
          socraticClue: 'Nhóm (8,46 + 1,54) = 10. Sau đó lấy 6 + 10 = ?',
          explanation: 'Chính xác! 8,46 + 1,54 = 10, kết hợp với 6 ra 16.',
        },
        {
          id: 'b21_task2',
          title: 'Bài 2: Nhân số thập phân với số thập phân (SGK trang 75)',
          prompt: 'Tính: 3,25 × 0,4',
          type: 'number_input',
          correctAnswer: '1.3',
          acceptableAnswers: ['1.3', '1,3', '1.30', '1,30'],
          socraticClue: '325 × 4 = 1300. Tách 3 chữ số thập phân: 1,300 = 1,3.',
          explanation: 'Tuyệt vời! 3,25 × 0,4 = 1,3.',
        },
        {
          id: 'b23_task3',
          title: 'Bài 3: Tuyệt chiêu dời dấu phẩy (SGK trang 85)',
          prompt: 'Kết quả của phép chia: 72,5 : 0,1 là bao nhiêu?',
          type: 'multiple_choice',
          options: [
            { id: 'opt_725', text: '725', isCorrect: true },
            { id: 'opt_7_25', text: '7,25', isCorrect: false },
            { id: 'opt_0_725', text: '0,725', isCorrect: false },
          ],
          socraticClue: 'Chia cho 0,1 chính là NHÂN với 10! Dời dấu phẩy sang phải 1 chữ số: 725.',
          explanation: 'Xuất sắc! Chia cho 0,1 tương đương nhân với 10 nên kết quả là 725.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Bẫy đặt tính trừ hai số thập phân (SGK trang 68)',
      situation:
        'Kiến Con thực hiện phép trừ: 45,2 - 13,75. Kiến Con thấy phần thập phân của số bị trừ chỉ có 1 chữ số (số 2), còn số trừ lại có 2 chữ số (75).',
      question: 'Kiến Con nên làm gì để đặt tính trừ chính xác nhất?',
      options: [
        {
          id: 'opt_add_zero',
          title: 'Viết thêm chữ số 0 vào bên phải để thành 45,20 rồi trừ bình thường',
          description: '45,20 - 13,75 = 31,45. Thẳng hàng cột dấu phẩy và mượn 1 như số tự nhiên.',
          isOptimal: true,
          scientificReason: 'Quy tắc vàng của SGK: Thêm chữ số 0 vào tận cùng bên phải số bị trừ để có cùng số chữ số thập phân.',
        },
        {
          id: 'opt_drop',
          title: 'Hạ thẳng số 5 xuống mà không cần mượn',
          description: 'Coi như 5 hạ xuống thành 5.',
          isOptimal: false,
          scientificReason: 'Đây là lỗi sai phổ biến! Phải coi là 0 trừ 5 được 5 nhớ 1.',
        },
      ],
      hintStage1: '45,2 = 45,20.',
      hintStage2: '0 không trừ được 5, mượn 1 chục là 10 - 5 = 5.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Nhân và chia số thập phân',
      guidingQuestion:
        'Tại sao chia cho 0,5 lại giống hệt như nhân với 2? Hãy giải thích bằng hình ảnh chiếc bánh.',
      helperBulletPoints: [
        '0,5 chính là phân số 1/2',
        'Chia cho 1/2 nghĩa là nhân với phân số đảo ngược 2/1',
        'Cắt các miếng bánh nửa cái: 4 cái bánh chia cho mỗi bạn 0,5 cái thì được 8 bạn!',
      ],
      sampleStarters: [
        'Kiến ơi, 0,5 chính là một nửa (1/2)...',
        'Khi chia cho 1/2, theo quy tắc chia phân số ta nhân đảo ngược với 2...',
      ],
      expectedConcepts: ['0,5 = 1/2', 'nhân nghịch đảo với 2', 'chia cho 0,1 = nhân 10'],
    },
  },

  // ==========================================
  // CHỦ ĐỀ 5: MỘT SỐ HÌNH PHẲNG. CHU VI VÀ DIỆN TÍCH
  // ==========================================
  {
    id: 'g5_toan_b25_b27_hinh_hoc_phang',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 5: Hình phẳng, chu vi & diện tích (Bài 25 - 27)',
    title: 'Tam giác, Hình thang, Hình tròn & Bánh xe lăn bánh',
    subtitle: 'Công thức diện tích tam giác S = (a x h)/2, diện tích hình thang và chu vi diện tích hình tròn (trang 91 - 112)',
    allyId: 'cham_can',
    estimatedMinutes: 15,
    xpReward: 190,
    discover: {
      storyTitle: 'Cuộc đua xe đạp và số vòng quay của bánh xe',
      storyContent:
        'Kiến Con chế tạo một chiếc xe đạp tí hon có đường kính bánh xe là 0,65 m. Trong chuyến dã ngoại, bạn đạp xe từ tổ kiến đến bờ suối một quãng đường dài 408,2 m. Kiến Con tò mò muốn biết bánh xe đã lăn được bao nhiêu vòng trên mặt đường!',
      realWorldContext:
        'Khi bánh xe lăn trọn 1 vòng, quãng đường đi được đúng bằng Chu vi của hình tròn: C = d × 3,14.',
      promptQuestion:
        'Chu vi của bánh xe có đường kính 0,65 m là bao nhiêu mét?',
      keyObservation:
        'Chu vi = 0,65 × 3,14 = 2,041 m. Số vòng quay = Quãng đường : Chu vi.',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Xưởng Hình Học Phẳng Kiến Trúc Sư',
      instructions:
        'Tính diện tích hình tam giác, hình thang và chu vi diện tích hình tròn theo các bài tập SGK trang 95, 102, 109.',
      hintStage1: 'Tam giác: S = (a × h) : 2. Hình thang: S = (đáy lớn + đáy bé) × h : 2. Hình tròn: S = r × r × 3,14.',
      hintStage2: 'Tam giác đáy 12 cm, cao 8 cm: S = (12 × 8) : 2 = 48 cm².',
      mathTasks: [
        {
          id: 'b25_task1',
          title: 'Bài 1: Diện tích hình tam giác (SGK trang 95)',
          prompt: 'Tính diện tích hình tam giác có độ dài đáy là 15 cm và chiều cao tương ứng là 10 cm:',
          type: 'number_input',
          correctAnswer: '75',
          acceptableAnswers: ['75'],
          unit: 'cm²',
          socraticClue: 'S = (15 × 10) : 2 = ?',
          explanation: 'Chính xác! (15 × 10) : 2 = 150 : 2 = 75 cm².',
        },
        {
          id: 'b26_task2',
          title: 'Bài 2: Diện tích hình thang (SGK trang 102)',
          prompt: 'Hình thang có đáy lớn 14 cm, đáy bé 10 cm và chiều cao 6 cm. Diện tích hình thang đó là bao nhiêu cm²?',
          type: 'number_input',
          correctAnswer: '72',
          acceptableAnswers: ['72'],
          unit: 'cm²',
          socraticClue: 'S = (14 + 10) × 6 : 2 = 24 × 3 = ?',
          explanation: 'Xuất sắc! (14 + 10) × 6 : 2 = 72 cm².',
        },
        {
          id: 'b27_task3',
          title: 'Bài 3: Diện tích hình tròn (SGK trang 109)',
          prompt: 'Tính diện tích hình tròn có bán kính r = 5 cm:',
          type: 'number_input',
          correctAnswer: '78.5',
          acceptableAnswers: ['78.5', '78,5'],
          unit: 'cm²',
          socraticClue: 'S = r × r × 3,14 = 5 × 5 × 3,14 = 25 × 3,14 = ?',
          explanation: 'Tuyệt vời! 25 × 3,14 = 78,5 cm².',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Bài toán số vòng lăn bánh xe đạp (SGK trang 110)',
      situation:
        'Bánh xe đạp có chu vi là 2,041 m. Xe đạp đi được quãng đường dài 408,2 m.',
      question: 'Bánh xe đã lăn được bao nhiêu vòng trên mặt đường?',
      options: [
        {
          id: 'opt_200',
          title: '200 vòng',
          description: 'Lấy quãng đường chia cho chu vi: 408,2 : 2,041 = 200 vòng.',
          isOptimal: true,
          scientificReason: 'Chính xác! 408,2 : 2,041 = 408 200 : 2 041 = 200 vòng tròn chĩnh.',
        },
        {
          id: 'opt_20',
          title: '20 vòng',
          description: 'Tính nhầm dấu phẩy.',
          isOptimal: false,
          scientificReason: '408,2 chia 2 hơn 200 lần, không thể là 20.',
        },
      ],
      hintStage1: 'Số vòng = Quãng đường : Chu vi bánh xe.',
      hintStage2: '408,2 : 2,041 = 200.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Bài thơ diện tích hình thang',
      guidingQuestion:
        'Tại sao công thức diện tích hình thang lại là "Đáy lớn đáy bé ta đem cộng vào, rồi đem nhân với chiều cao, chia đôi lấy nửa thế nào cũng ra"? Hãy chứng minh bằng cách ghép 2 hình thang bằng nhau thành hình bình hành.',
      helperBulletPoints: [
        'Ghép hai hình thang giống nhau ngược đầu lại',
        'Tạo thành hình bình hành có đáy = (a + b) và chiều cao h',
        'Diện tích hình bình hành = (a + b) × h, nên 1 hình thang chia đôi',
      ],
      sampleStarters: [
        'Kiến ơi, nếu bạn lấy hai hình thang giống hệt nhau rồi lộn ngược một hình lại...',
        'Hai hình thang sẽ ghép khít thành một hình bình hành lớn có diện tích là...',
      ],
      expectedConcepts: ['ghép 2 hình thang', 'hình bình hành', 'đáy lớn cộng đáy bé', 'chia đôi'],
    },
  },

  // ==========================================
  // CHỦ ĐỀ 6: ÔN TẬP HỌC KÌ 1
  // ==========================================
  {
    id: 'g5_toan_b30_b35_tong_on_hk1',
    subjectId: 'toan_5',
    grade: 5,
    unit: 'Chủ đề 6: Ôn tập học kì 1 (Bài 30 - 35)',
    title: 'Tổng ôn học kì 1 toàn diện & Chinh phục kỳ thi',
    subtitle: 'Hệ thống hóa toàn bộ kiến thức: Số thập phân, 4 phép tính, đại lượng đo lường và hình học phẳng (trang 120 - 138)',
    allyId: 'cham_can',
    estimatedMinutes: 20,
    xpReward: 250,
    discover: {
      storyTitle: 'Đại hội Trạng Nguyên Toán Học Vương Quốc Kiến',
      storyContent:
        'Học kì 1 đã khép lại! Toàn thể thần dân vương quốc kiến cùng tụ hội tại Đấu trường Tri thức để tham gia kỳ thi Trạng Nguyên. Tất cả các nội dung từ bài 1 đến bài 35: số tự nhiên, phân số, số thập phân, héc-ta, tam giác, hình thang và hình tròn đều được tổng hợp trong thử thách vinh quang này!',
      realWorldContext:
        'Kỳ thi cuối học kì 1 đánh giá toàn diện năng lực tư duy toán học, khả năng giải quyết vấn đề và vận dụng kiến thức vào thực tế cuộc sống.',
      promptQuestion:
        'Bạn đã sẵn sàng cùng Kiến Con vượt qua 3 thử thách tổng hợp đỉnh cao của học kì 1 chưa?',
      keyObservation:
        'Bình tĩnh đọc kĩ đề, nhận diện đúng dạng toán, chú ý bẫy đổi đơn vị đo và kiểm tra lại kết quả!',
    },
    practice: {
      type: 'math_interactive',
      challengeTitle: 'Thử Thách Trạng Nguyên Toán 5 Học Kì 1',
      instructions:
        'Giải các câu hỏi tổng hợp chọn lọc từ các bài ôn tập cuối học kì 1 (SGK trang 120 - 135).',
      hintStage1: 'Chú ý: Cùng đơn vị đo trước khi tính diện tích hoặc chu vi.',
      hintStage2: 'Tính nhanh: Tách các số hạng đưa về tròn chục, tròn trăm.',
      mathTasks: [
        {
          id: 'b30_task1',
          title: 'Bài 1: Giá trị chữ số trong số thập phân (SGK trang 120)',
          prompt: 'Giá trị của chữ số 7 trong số thập phân 12,375 là:',
          type: 'multiple_choice',
          options: [
            { id: 'opt_7_100', text: '7/100 (Bảy phần trăm)', isCorrect: true },
            { id: 'opt_7_10', text: '7/10', isCorrect: false },
            { id: 'opt_7_1000', text: '7/1000', isCorrect: false },
            { id: 'opt_70', text: '70', isCorrect: false },
          ],
          socraticClue: 'Chữ số 7 đứng ở hàng thứ 2 sau dấu phẩy (hàng phần trăm).',
          explanation: 'Chính xác! Chữ số 7 có giá trị là 7/100 hay 0,07.',
        },
        {
          id: 'b31_task2',
          title: 'Bài 2: Tính nhanh thừa số chung (SGK trang 124)',
          prompt: 'Tính giá trị biểu thức bằng cách thuận tiện: \n4,8 × 3,5 + 4,8 × 6,5',
          type: 'number_input',
          correctAnswer: '48',
          acceptableAnswers: ['48'],
          socraticClue: 'Đặt 4,8 ra ngoài: 4,8 × (3,5 + 6,5) = 4,8 × 10 = ?',
          explanation: 'Tuyệt vời! 4,8 × 10 = 48.',
        },
        {
          id: 'b33_task3',
          title: 'Bài 3: Thửa ruộng hình thang thu hoạch thóc (SGK trang 132)',
          prompt: 'Một thửa ruộng hình thang có đáy lớn 120 m, đáy bé bằng 2/3 đáy lớn, chiều cao 40 m. Biết cứ 100 m² thu hoạch được 60 kg thóc. Hỏi cả thửa ruộng thu hoạch được bao nhiêu tạ thóc?',
          type: 'number_input',
          correctAnswer: '24',
          acceptableAnswers: ['24'],
          unit: 'tạ',
          socraticClue: 'Đáy bé = 120 × 2/3 = 80 m. Diện tích = (120 + 80) × 40 : 2 = 4 000 m². Số thóc = (4 000 : 100) × 60 = 2 400 kg. Đổi 2 400 kg = 24 tạ!',
          explanation: 'Xuất sắc! 2 400 kg = 24 tạ thóc.',
        },
      ],
    },
    apply: {
      dilemmaTitle: 'Chiến lược phân bổ thời gian làm bài thi 40 phút',
      situation:
        'Đề thi cuối học kì 1 gồm 10 câu trắc nghiệm và 4 câu tự luận giải toán có lời văn trong thời gian 40 phút.',
      question: 'Chiến lược phân bổ thời gian nào giúp bạn đạt điểm tối đa và không bị tiếc nuối?',
      options: [
        {
          id: 'opt_strategy_best',
          title: 'Dành 12 phút làm chắc phần trắc nghiệm, 23 phút làm tự luận, 5 phút soát lại toàn bộ bài',
          description: 'Làm từ câu dễ đến câu khó, không sa đà vào một câu hóc búa, luôn dành 5 phút cuối kiểm tra đơn vị đo và phép tính.',
          isOptimal: true,
          scientificReason: 'Chiến thuật phòng thi khoa học giúp tối ưu hóa điểm số và tránh những lỗi sai ngớ ngẩn.',
        },
        {
          id: 'opt_strategy_rush',
          title: 'Làm ngay câu sao (*) khó nhất trước',
          description: 'Để giành trọn điểm 10 câu khó.',
          isOptimal: false,
          scientificReason: 'Rất nguy hiểm vì nếu bị kẹt sẽ mất nhiều thời gian và tâm lý hoảng loạn, không kịp làm các câu cơ bản.',
        },
      ],
      hintStage1: 'Quy tắc: Dễ trước, khó sau. Chắc chắn từng câu.',
      hintStage2: 'Luôn giữ lại ít nhất 5 phút để kiểm tra lại phép tính.',
    },
    teachBack: {
      promptTitle: 'Dạy lại cho Kiến Con: Cẩm nang bí kíp Học Kì 1',
      guidingQuestion:
        'Nếu Kiến Con nhờ bạn tóm tắt 3 quy tắc quan trọng nhất cần nhớ trong toàn bộ học kì 1 môn Toán lớp 5, bạn sẽ chọn 3 quy tắc nào?',
      helperBulletPoints: [
        'Quy tắc thẳng cột dấu phẩy và dời dấu phẩy của số thập phân',
        'Quy tắc đổi đơn vị diện tích (1 ha = 10 000 m², mỗi đơn vị diện tích liền kề hơn kém nhau 100 lần)',
        'Quy tắc chia đôi trong công thức diện tích tam giác và hình thang',
      ],
      sampleStarters: [
        'Quy tắc số 1 mình muốn nhắc Kiến là khi cộng trừ số thập phân, dấu phẩy phải...',
        'Quy tắc số 2 là diện tích tam giác và hình thang luôn phải nhớ chia cho 2...',
        'Quy tắc số 3 là đơn vị diện tích mỗi bước nhảy gấp hoặc giảm 100 lần...',
      ],
      expectedConcepts: ['dấu phẩy thẳng cột', 'chia đôi diện tích', '1 ha = 10 000 m2', 'nhân nhẩm 10, 100, 0,1'],
    },
  },
];
