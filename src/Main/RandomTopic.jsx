import React, { useState, useRef } from "react";
import { FaRandom } from "react-icons/fa";

export default function DebateRandomizer() {
  const [topic, setTopic] = useState(null);
  const [spinning, setSpinning] = useState(false);

    const topics = [
    "Học sinh có nên được phép sử dụng điện thoại trong lớp học không?",
    "Bài tập về nhà có nên bị bãi bỏ không?",
    "Học sinh có nên mặc đồng phục đến trường không?",
    "Điểm số có phản ánh chính xác năng lực học sinh không?",
    "Trường học có nên bắt đầu muộn hơn vào buổi sáng không?",
    "Học sinh có nên được tự chọn môn học bắt buộc không?",
    "Thi cử là cách đánh giá tốt nhất năng lực học sinh phải không?",
    "Học sinh có nên được nghỉ học vào thứ Bảy không?",
    "Mạng xã hội mang lại nhiều lợi ích hơn tác hại cho học sinh phải không?",
    "Học trực tuyến hiệu quả hơn học trực tiếp phải không?",
    "Trường học có nên cấm hoàn toàn trò chơi điện tử không?",
    "Học sinh có nên được phép ăn trong lớp học không?",
    "Việc xếp hạng học sinh có nên bị loại bỏ không?",
    "Học sinh có nên tham gia hoạt động tình nguyện bắt buộc không?",
    "Đồng phục giúp giảm bắt nạt học đường phải không?",
    "Trường học có nên lắp camera trong mọi lớp học không?",
    "Học sinh có nên được quyền đánh giá giáo viên không?",
    "Các môn nghệ thuật có quan trọng ngang với toán và văn không?",
    "Học sinh có nên được tự do chọn chỗ ngồi trong lớp không?",
    "Mỗi học sinh có nên sở hữu một máy tính cá nhân do trường cấp không?",
    "Giáo dục giới tính có nên là môn học bắt buộc không?",
    "Học sinh có nên được phép nhuộm tóc đến trường không?",
    "Các kỳ thi cuối kỳ có nên bị thay thế bằng dự án thực tế không?",
    "Học sinh có nên được phép sử dụng AI để hỗ trợ học tập không?",
    "Thành tích học tập quan trọng hơn kỹ năng mềm phải không?",
    "Trường học có nên kéo dài thời gian nghỉ trưa không?",
    "Học sinh có nên học lập trình từ cấp hai không?",
    "Việc học thêm có thực sự cần thiết không?",
    "Học sinh có nên được phép đi học bằng xe máy từ lớp 10 không?",
    "Đọc sách giấy hiệu quả hơn đọc sách điện tử phải không?",
    "Học sinh có nên tham gia các câu lạc bộ ngoại khóa bắt buộc không?",
    "Thể dục nên được tăng số tiết trong tuần phải không?",
    "Trường học có nên tổ chức các cuộc thi học thuật thường xuyên hơn không?",
    "Học sinh có nên được nghỉ học để theo đuổi tài năng đặc biệt không?",
    "Học sinh có nên được phép sử dụng ChatGPT trong học tập không?",
    "Các môn học hiện nay có quá nặng so với học sinh không?",
    "Học sinh có nên được dạy kỹ năng quản lý tài chính cá nhân không?",
    "Trường học có nên cấm hoàn toàn đồ ăn nhanh không?",
    "Học sinh có nên được quyền lựa chọn giáo viên chủ nhiệm không?",
    "Kỷ luật nghiêm khắc giúp học sinh tiến bộ hơn phải không?",
    "Trường học có nên công khai bảng điểm của học sinh không?",
    "Học sinh có nên được nhận lương khi tham gia thực tập không?",
    "Việc học ngoại ngữ thứ hai có nên bắt buộc không?",
    "Học sinh có nên được phép mang thú cưng đến trường không?",
    "Các cuộc thi sắc đẹp dành cho học sinh có nên tồn tại không?",
    "Trường học có nên giới hạn thời gian sử dụng Internet của học sinh không?",
    "Học sinh có nên được phép bỏ một số môn không liên quan đến định hướng nghề nghiệp không?",
    "Hoạt động nhóm hiệu quả hơn làm việc cá nhân phải không?",
    "Học sinh có nên được học võ tự vệ tại trường không?",
    "Các môn thể thao điện tử có nên được công nhận là hoạt động ngoại khóa chính thức không?",
    "Trường học có nên có đồng phục riêng cho mùa hè và mùa đông không?",
    "Học sinh có nên được nghỉ một ngày mỗi tháng vì lý do sức khỏe tinh thần không?",
    "Điện thoại thông minh làm giảm khả năng tập trung của học sinh phải không?",
    "Học sinh có nên được tham gia vào việc xây dựng nội quy trường học không?",
    "Các môn khoa học nên được ưu tiên hơn các môn xã hội phải không?",
    "Trường học có nên cho phép học sinh đi học muộn trong một số trường hợp không?",
    "Học sinh có nên được thưởng tiền khi đạt thành tích cao không?",
    "Các kỳ nghỉ hè nên được rút ngắn phải không?",
    "Học sinh có nên học kỹ năng sơ cứu bắt buộc không?",
    "Trường học có nên tổ chức lớp học ngoài trời thường xuyên hơn không?",
    "Học sinh có nên được phép làm thêm trong thời gian đi học không?",
    "Việc sử dụng sách giáo khoa điện tử có nên thay thế hoàn toàn sách giấy không?",
    "Trường học có nên cấm hoàn toàn việc quay video trong khuôn viên trường không?",
    "Học sinh có nên được học về đầu tư tài chính từ sớm không?",
    "Các bài kiểm tra trắc nghiệm tốt hơn bài kiểm tra tự luận phải không?",
    "Học sinh có nên được phép tự thiết kế đồng phục của lớp mình không?",
    "Trường học có nên cung cấp bữa ăn miễn phí cho tất cả học sinh không?",
    "Học sinh có nên được phép mang laptop đến lớp học không?",
    "Việc học thuộc lòng còn cần thiết trong thời đại Internet không?",
    "Trường học có nên giới hạn số lượng bài tập về nhà mỗi ngày không?",
    "Học sinh có nên được quyền chọn thời khóa biểu cá nhân không?",
    "Các môn kỹ năng sống nên trở thành môn học chính thức phải không?",
    "Học sinh có nên được đánh giá qua hồ sơ năng lực thay vì điểm số không?",
    "Trường học có nên tổ chức một ngày không sử dụng công nghệ mỗi tháng không?",
    "Học sinh có nên được quyền từ chối tham gia một số hoạt động ngoại khóa không?",
    "Học sinh giỏi có nên được miễn một số bài kiểm tra không?",
    "Trường học có nên kéo dài năm học để nâng cao chất lượng giáo dục không?",
    "Học sinh có nên học về trí tuệ nhân tạo từ cấp THPT không?",
    "Các kỳ thi tuyển sinh có nên bị bãi bỏ không?",
    "Học sinh có nên được quyền bỏ phiếu cho các quyết định quan trọng của trường không?",
    "Trường học có nên mở cửa thư viện vào cuối tuần không?",
    "Học sinh có nên tham gia các khóa học trực tuyến quốc tế không?",
    "Điểm chuyên cần có nên ảnh hưởng đến kết quả học tập không?",
    "Trường học có nên áp dụng đồng phục thể thao hằng ngày không?",
    "Học sinh có nên được học kỹ năng thuyết trình bắt buộc không?",
    "Các môn học hiện tại có phù hợp với nhu cầu nghề nghiệp tương lai không?",
    "Học sinh có nên được phép sử dụng tai nghe trong giờ tự học không?",
    "Trường học có nên giảm số lượng môn học trong một học kỳ không?",
    "Học sinh có nên được tham gia đánh giá chương trình học không?",
    "Việc sử dụng AI trong làm bài tập có nên bị cấm hoàn toàn không?",
    "Học sinh có nên được phép nghỉ học để tham gia các giải đấu thể thao không?",
    "Trường học có nên yêu cầu học sinh đọc ít nhất một cuốn sách mỗi tháng không?",
    "Học sinh có nên học kiến thức về khởi nghiệp từ THPT không?",
    "Các kỳ thi học sinh giỏi có thực sự cần thiết không?",
    "Trường học có nên cho phép học sinh tự tổ chức sự kiện trong trường không?",
    "Học sinh có nên được đánh giá kỹ năng giao tiếp như một môn học chính thức không?",
    "Học sinh có nên có quyền lựa chọn giữa học trực tiếp và học trực tuyến không?",
    "Việc học ở trường có quan trọng hơn việc tự học không?",
    "Trường học có nên thay thế một phần sách giáo khoa bằng nội dung số không?"
    ];

  const handleRandom = () => {
    if (spinning) return;
    setSpinning(true);

    let speed = 50;
    let count = 0;

    const spin = () => {
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      setTopic(randomTopic);
      count++;
      if (count < 40) {
        speed += 5;
        setTimeout(spin, speed);
      } else {
        setSpinning(false);
      }
    };

    spin();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes orbPulse {
          0%,100% { transform: scale(1);   opacity: 0.6; }
          50%      { transform: scale(1.1); opacity: 1;   }
        }
        @keyframes spinFlicker {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @keyframes resultIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes ringExpand {
          from { transform: scale(0.7); opacity: 0.8; }
          to   { transform: scale(1.6); opacity: 0;   }
        }

        .dr-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          background:
            radial-gradient(ellipse 80% 50% at 15% 10%,  rgba(224,200,151,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 90%, rgba(200,168,107,0.15) 0%, transparent 55%),
            linear-gradient(160deg, #fffdf7 0%, #fdf5e4 40%, #fff9ef 100%);
          padding: 40px 24px;
          position: relative;
          overflow: hidden;
        }

        /* dot pattern */
        .dr-page::before {
          content: '';
          position: fixed; inset: 0;
          background-image: radial-gradient(circle, rgba(200,168,107,0.13) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        /* floating blobs */
        .dr-blob {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .dr-blob-1 {
          width: 380px; height: 380px;
          top: -100px; right: -100px;
          background: radial-gradient(circle, rgba(224,200,151,0.22) 0%, transparent 70%);
          animation: orbPulse 6s ease-in-out infinite;
        }
        .dr-blob-2 {
          width: 280px; height: 280px;
          bottom: -80px; left: -60px;
          background: radial-gradient(circle, rgba(200,168,107,0.15) 0%, transparent 70%);
          animation: orbPulse 8s ease-in-out 2s infinite;
        }

        /* card */
        .dr-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(14px);
          border: 1.5px solid rgba(224,200,151,0.5);
          border-radius: 28px;
          padding: 52px 44px 44px;
          box-shadow:
            0 8px 40px rgba(160,120,64,0.13),
            0 1px 0 rgba(255,255,255,0.95) inset;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }

        /* eyebrow */
        .dr-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #a07840;
          font-weight: 600;
        }
        .dr-eyebrow::before,
        .dr-eyebrow::after {
          content: '';
          display: inline-block;
          width: 20px; height: 1.5px;
          background: linear-gradient(90deg, transparent, #c8a86b);
          border-radius: 2px;
        }
        .dr-eyebrow::after {
          background: linear-gradient(90deg, #c8a86b, transparent);
        }

        /* title */
        .dr-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 4vw, 36px);
          font-weight: 900;
          background: linear-gradient(135deg, #7a5c2e 0%, #c8a86b 50%, #e0c897 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.15;
          animation: shimmer 4s linear infinite;
          margin-top: -16px;
        }

        /* result box */
        .dr-result-wrap {
          width: 100%;
          min-height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .dr-result-empty {
          font-size: 14px;
          color: rgba(160,120,64,0.45);
          font-style: italic;
          letter-spacing: 0.3px;
        }
        .dr-result-box {
          width: 100%;
          background: linear-gradient(135deg, rgba(253,248,239,0.9), rgba(245,237,216,0.8));
          border: 1.5px solid rgba(224,200,151,0.55);
          border-radius: 18px;
          padding: 24px 28px;
          position: relative;
          overflow: hidden;
        }
        .dr-result-box::before {
          content: '"';
          position: absolute;
          top: -10px; left: 14px;
          font-family: 'Playfair Display', serif;
          font-size: 80px;
          color: rgba(224,200,151,0.3);
          line-height: 1;
          pointer-events: none;
        }
        .dr-result-text {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          font-weight: 700;
          color: #2a1f0e;
          line-height: 1.55;
          position: relative;
          z-index: 1;
        }
        .dr-result-text.spinning {
          animation: spinFlicker 0.12s ease infinite;
          color: #a07840;
        }
        .dr-result-text.settled {
          animation: resultIn 0.4s cubic-bezier(.22,1,.36,1) both;
        }

        /* divider */
        .dr-divider {
          width: 100%;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(224,200,151,0.5), transparent);
          border: none;
        }

        /* button */
        .dr-btn-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        /* ring effect when idle after result */
        .dr-ring {
          position: absolute;
          inset: -6px;
          border-radius: 50px;
          border: 2px solid rgba(224,200,151,0.5);
          animation: ringExpand 1.8s ease-out infinite;
          pointer-events: none;
        }
        .dr-btn {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 44px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #a07840 0%, #c8a86b 50%, #e0c897 100%);
          background-size: 200% auto;
          color: #2a1f0e;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(160,120,64,0.35);
          transition: background-position 0.3s, transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          text-transform: uppercase;
        }
        .dr-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 8px 30px rgba(160,120,64,0.45);
          transform: translateY(-2px);
        }
        .dr-btn:active:not(:disabled) { transform: translateY(0); }
        .dr-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .dr-btn-icon {
          font-size: 18px;
          display: inline-block;
          transition: transform 0.2s;
        }
        .dr-btn:hover:not(:disabled) .dr-btn-icon {
          transform: rotate(30deg);
        }
        .dr-btn:disabled .dr-btn-icon {
          animation: float 0.4s ease-in-out infinite;
        }

        /* tags */
        .dr-tags {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          width: 100%;
        }
        .dr-tag {
          padding: 4px 13px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          background: rgba(224,200,151,0.15);
          border: 1px solid rgba(224,200,151,0.45);
          color: #a07840;
          letter-spacing: 0.3px;
        }
      `}</style>

      <div className="dr-page">
        <div className="dr-blob dr-blob-1" />
        <div className="dr-blob dr-blob-2" />

        <div className="dr-card">
          <div className="dr-eyebrow">Debates AI</div>

          <div className="dr-title">Ngẫu Nhiên Chủ Đề</div>

          {/* result */}
          <div className="dr-result-wrap">
            {topic === null ? (
              <div className="dr-result-empty">Nhấn nút bên dưới để bắt đầu quay ngẫu nhiên...</div>
            ) : (
              <div className="dr-result-box">
                <div className={`dr-result-text ${spinning ? "spinning" : "settled"}`}>
                  {topic}
                </div>
              </div>
            )}
          </div>

          <hr className="dr-divider" />

          {/* button */}
          <div className="dr-btn-wrap">
            {!spinning && topic !== null && <div className="dr-ring" />}
            <button className="dr-btn" onClick={handleRandom} disabled={spinning}>
              <span className="dr-btn-icon"><FaRandom /></span>
              {spinning ? "Đang quay..." : "Ngẫu nhiên chủ đề"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}