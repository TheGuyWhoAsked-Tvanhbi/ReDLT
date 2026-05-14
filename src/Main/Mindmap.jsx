import { useEffect, useRef } from "react"

const MindmapPage = () => {
  const heroRef    = useRef(null)
  const cardsRef   = useRef([])
  const containerRef = useRef(null)
  const guideRef   = useRef(null)

  // Dùng IntersectionObserver thay cho CSS animation để kiểm soát tốt hơn
  useEffect(() => {
    const targets = [
      heroRef.current,
      ...cardsRef.current,
      containerRef.current,
      guideRef.current
    ].filter(Boolean)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity    = "1"
            entry.target.style.transform  = "translateY(0)"
          }
        })
      },
      { threshold: 0.15 }
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const featureCards = [
    { title: "Tổ chức ý tưởng",   desc: "Sắp xếp luận điểm, dẫn chứng rõ ràng, tránh bỏ sót" },
    { title: "Liên kết thông tin", desc: "Dễ phản biện, mở rộng và kết nối ý tưởng" },
    { title: "Ghi nhớ & trình bày",desc: "Kích thích trí nhớ thị giác, diễn đạt mạch lạc, tự tin" },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Be+Vietnam+Pro:wght@400;500;600&display=swap');

        .mm-section { font-family: 'Be Vietnam Pro', sans-serif; color: #4B3F2F; background: #faf8f4; padding: 20px 16px 60px; }

        /* Hero */
        .mm-hero {
          padding: 48px 32px; text-align: center;
          background: linear-gradient(135deg, #fffaf1, #fdf6eb);
          border-radius: 20px; margin: 30px auto 24px;
          max-width: 860px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.10);
          opacity: 0; transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .mm-hero h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(22px, 3vw, 34px);
          font-weight: 600; color: #B57A00; margin: 0 0 12px;
        }
        .mm-hero p { font-size: 16px; line-height: 1.6; margin: 0; color: #6B4C27; }

        /* Features */
        .mm-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px; max-width: 860px; margin: 0 auto 28px; padding: 0 4px;
        }
        @media (max-width: 600px) { .mm-features { grid-template-columns: 1fr; } }

        .mm-card {
          background: #fff; border-radius: 16px; padding: 22px 18px;
          text-align: center; border: 1px solid #f0e8d0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .mm-card:hover { transform: translateY(-6px) scale(1.03); box-shadow: 0 14px 32px rgba(0,0,0,0.13); }
        .mm-card h3 { color: #B57A00; margin: 0 0 10px; font-size: 16px; font-weight: 600; }
        .mm-card p  { font-size: 14px; line-height: 1.6; color: #4B3F2F; margin: 0; }

        /* Container */
        .mm-container {
          max-width: 820px; margin: 0 auto 40px; padding: 32px 28px;
          border-radius: 20px;
          background: linear-gradient(270deg, #FFF6E5, #FCECD2, #FFF9F0);
          background-size: 400% 400%;
          animation: gradientShift 12s ease infinite;
          box-shadow: 0 10px 36px rgba(0,0,0,0.11);
          text-align: center;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .mm-container-title {
          font-family: 'Playfair Display', serif;
          color: #B57A00; font-size: clamp(20px, 2.5vw, 28px); margin: 0 0 8px;
        }
        .mm-container-sub { font-size: 14px; color: #6B4C27; margin: 0 0 20px; }

        /* Guide */
        .mm-guide {
          background: #fff; border: 1px solid #EAD6A0; border-radius: 14px;
          padding: 20px 24px; color: #5C4423; text-align: left; margin-bottom: 20px;
          opacity: 0; transform: translateY(15px);
          transition: opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s;
        }
        .mm-guide h3 { font-size: 17px; color: #9C6C19; margin: 0 0 12px; }
        .mm-guide ol { margin: 0; padding-left: 20px; }
        .mm-guide li { margin: 8px 0; line-height: 1.6; font-size: 14px; }
        .mm-guide .tip { font-size: 13px; color: #8B6C42; margin: 12px 0 0; font-style: italic; }

        /* Button */
        .mm-btn {
          display: inline-block;
          background: linear-gradient(135deg, #FFD56F, #D4A017);
          color: #4B3209; font-size: 17px; font-weight: 700;
          padding: 14px 40px; border-radius: 14px; text-decoration: none;
          box-shadow: 0 6px 18px rgba(212,160,23,0.35);
          transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
          animation: pulse 2.2s ease-in-out infinite;
        }
        .mm-btn:hover {
          transform: scale(1.07) rotate(-1deg);
          background: linear-gradient(135deg, #FFC94B, #B07B1E);
          box-shadow: 0 12px 24px rgba(176,123,30,0.45);
          animation: none;
        }

        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.05); }
        }
      `}</style>

      <section className="mm-section">

        {/* Hero */}
        <div className="mm-hero" ref={heroRef}>
          <h1>Tạo mindmap tranh biện cho trận đấu của bạn</h1>
          <p>Ghi nhớ, kết nối và sắp xếp ý tưởng nhanh gọn ngay trên website.</p>
        </div>

        {/* Feature Cards */}
        <div className="mm-features">
          {featureCards.map((card, i) => (
            <div
              key={i}
              className="mm-card"
              ref={(el) => (cardsRef.current[i] = el)}
              style={{ transitionDelay: `${0.1 + i * 0.15}s` }}
            >
              <h3>{card.title}</h3>
              <p>{card.desc}</p>
            </div>
          ))}
        </div>

        {/* Mindmap Container */}
        <div className="mm-container" ref={containerRef}>
          <h2 className="mm-container-title">✨ Tạo Mindmap - Sơ đồ tư duy cho bạn</h2>
          <p className="mm-container-sub">Vẽ sơ đồ tư duy sáng tạo, đẹp mắt và lưu ngay trên thiết bị của bạn</p>

          {/* Guide */}
          <div className="mm-guide" ref={guideRef}>
            <h3>Hướng dẫn:</h3>
            <ol>
              <li>Nhấn nút <strong>"🚀 Bắt đầu tạo Mindmap"</strong> để mở công cụ trong tab mới.</li>
              <li>Chọn <strong>"Device"</strong> khi được hỏi <em>"Where do you want to store your diagrams?"</em></li>
              <li>Thêm nhánh, ý tưởng và kết nối bằng các công cụ kéo thả.</li>
              <li>Xuất sơ đồ qua <strong>File → Export as → PNG</strong> hoặc lưu file XML.</li>
            </ol>
            <p className="tip">💡 Mẹo: Phối màu và icon trong tool để mindmap "bùng nổ" hơn 🌟</p>
          </div>
          <a
            href="https://app.diagrams.net/?splash=0&storage=browser"
            target="_blank"
            rel="noreferrer"
            className="mm-btn">
            🚀 Bắt đầu tạo Mindmap
          </a>
        </div>

      </section>
    </>
  )
}

export default MindmapPage