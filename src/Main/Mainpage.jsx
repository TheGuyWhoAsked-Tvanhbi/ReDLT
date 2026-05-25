import { useState, useEffect, useRef } from "react"

function Mainpage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(0)
  const imageRef = useRef(null)
  const [imageTop, setImageTop] = useState(0)
  const containerRef = useRef(null)
  const quickStartRef = useRef(null)
  const [quickStartTop, setQuickStartTop] = useState(0)
  const [quickStartHeight, setQuickStartHeight] = useState(0)

  const slides = [
    {
      id: 1,
      title: "ReDLT – Nền tảng tranh biện trực tuyến dành cho học sinh phổ thông",
      description: "Không chỉ là nơi học tranh biện, ReDLT là không gian để bạn cất lên quan điểm, rèn luyện tư duy và tự tin thể hiện bản thân.",
      image: "/src/assets/WhiteStyle2_img.jpg"
    },
    {
      id: 2,
      title: "Học tranh biện theo cách gần gũi với học sinh",
      description: "Không khô khan hay quá học thuật, ReDLT xây dựng môi trường thân thiện, trực quan và dễ tiếp cận cho học sinh phổ thông.",
      image: "/src/assets/WhiteStyle_img.jpg"
    },
    {
      id: 3,
      title: "Thông điệp của ReDLT",
      description: "Tranh biện không phải để thắng người khác, mà để hiểu thế giới rõ hơn và hoàn thiện chính mình hơn mỗi ngày.",
      image: "/src/assets/WhitetoGreen_img.jpg"
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 10000)
    return () => clearInterval(timer)
  }, [slides.length])

  useEffect(() => {
    if (currentIndex === displayIndex) return

    setAnimating("exit")

    const swapTimer = setTimeout(() => {
      setDisplayIndex(currentIndex)
      setAnimating("enter")
    }, 350)

    const doneTimer = setTimeout(() => {
      setAnimating(false)
    }, 700)

    return () => {
      clearTimeout(swapTimer)
      clearTimeout(doneTimer)
    }
  }, [currentIndex])

  useEffect(() => {
    const calcOffset = () => {
      if (imageRef.current && containerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        setImageTop(imgRect.top - containerRect.top)
      }
      if (quickStartRef.current) {
        const el = quickStartRef.current
        let top = 0
        let node = el
        while (node) {
          top += node.offsetTop || 0
          node = node.offsetParent
        }
        setQuickStartTop(top)
        setQuickStartHeight(el.offsetHeight)
      }
    }
    calcOffset()
    window.addEventListener("resize", calcOffset)
    return () => window.removeEventListener("resize", calcOffset)
  }, [])

  const currentSlide = slides[displayIndex]

  const imageAnimStyle =
    animating === "exit"
      ? { transform: "translateX(-60px)", opacity: 0, transition: "transform 350ms ease, opacity 350ms ease" }
      : animating === "enter"
      ? { transform: "translateX(0px)", opacity: 1, transition: "transform 350ms ease, opacity 350ms ease",
          animation: "slideEnter 350ms ease forwards" }
      : {}

  return (
    <>
      <style>{`
        @keyframes slideEnter {
          from { transform: translateX(50px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-up {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }
        .delay-3 { animation-delay: 0.6s; }
        .delay-4 { animation-delay: 0.8s; }

        .qs-banner {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          width: 100vw;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }
        .qs-banner img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* About Us section styles */
        .about-hero {
          position: relative;
          width: 100%;
          height: 380px;
          overflow: hidden;
          border-radius: 16px;
          margin-bottom: 60px;
        }
        .about-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .about-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 100%);
          display: flex;
          align-items: flex-start;
          padding: 40px 48px;
        }
        .about-hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 700;
          color: #fff;
          line-height: 1.15;
          max-width: 400px;
        }
        .about-hero-sub {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.82);
          max-width: 260px;
          line-height: 1.6;
          text-align: right;
          position: absolute;
          top: 40px;
          right: 48px;
        }
        .about-scroll-btn {
          position: absolute;
          bottom: 32px;
          right: 48px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #4fc78e;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(79,199,142,0.35);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .about-scroll-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(79,199,142,0.45);
        }

        .about-body {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
          margin-bottom: 48px;
        }

        @media (max-width: 768px) {
          .about-body {
            grid-template-columns: 1fr;
          }
        }

        .about-quote-mark {
          font-size: 52px;
          line-height: 1;
          color: #c8a96e;
          font-family: Georgia, serif;
          margin-bottom: 12px;
          display: block;
        }
        .about-quote-text {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: clamp(15px, 1.6vw, 18px);
          color: #3D2B1F;
          line-height: 1.75;
          font-weight: 400;
        }
        .about-quote-img {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 12px;
          margin-top: 28px;
          display: block;
        }

        .about-card {
          background: linear-gradient(135deg, #4A3728 0%, #2d1f14 100%);
          border-radius: 16px;
          padding: 36px 32px;
          color: #fff;
        }
        .about-card-label {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: #c8a96e;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .about-card-label svg {
          flex-shrink: 0;
        }
        .about-card p {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 14px;
          color: rgba(255,255,255,0.78);
          line-height: 1.75;
          margin: 0 0 18px;
        }

        .about-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border: 1px solid rgba(79, 199, 142, 0.2);
          border-radius: 16px;
          overflow: hidden;
          background: rgba(255,255,255,0.6);
          backdrop-filter: blur(10px);
        }
        .about-stat-item {
          padding: 32px 24px;
          text-align: center;
          border-right: 1px solid rgba(79,199,142,0.15);
        }
        .about-stat-item:last-child {
          border-right: none;
        }
        .about-stat-number {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 700;
          color: #4A3728;
          display: block;
          line-height: 1;
          margin-bottom: 6px;
        }
        .about-stat-label {
          font-family: 'Be Vietnam Pro', sans-serif;
          font-size: 13px;
          color: #888;
        }

        /* About section separator */
        .about-section {
          background: #f9f4ec;
          position: relative;
        }
      `}</style>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Be+Vietnam+Pro:wght@400;500;600&display=swap" />

      <div style={{ position: "relative" }}>

        {/* Gradient nền */}
        {quickStartTop > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 900,
              background: "linear-gradient(to bottom, #ffffff 0%, #fbe4bb 100%)",
              zIndex: 0,
              pointerEvents: "none"
            }}
          />
        )}

        <div
          className="qs-banner"
          aria-hidden="true"
          style={{
            top: -120,
            opacity: quickStartTop > 0 ? 1 : 0,
          }}
        >
          <img
            src="/src/assets/pattern01.png"
            alt=""
          />
        </div>

        {/* Box chéo màu — chéo trên (phải cao hơn trái) + chéo dưới (phải cao hơn trái) */}
        {quickStartTop > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: quickStartTop - 80,
              left: 0,
              right: 0,
              height: quickStartHeight - 60,
              zIndex: 2,
              pointerEvents: "none",
              filter: "drop-shadow(0px -15px 20px rgba(0,0,0,0.1))"
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "#e0c897",
                /* Trên: trái thấp (80px offset), phải cao (0)
                   Dưới: phải cao hơn (100% - 0), trái thấp hơn (100% - 60px) */
                clipPath: "polygon(0 0, 100% 80px, 100% calc(100% - 60px), 0 100%)",
              }}
            />
          </div>
        )}

        {/* z:3 — Toàn bộ nội dung */}
        <div style={{ position: "relative", zIndex: 3 }}>

          {/* HERO SLIDER */}
          <div ref={containerRef} style={styles.container}>
            <div
              className="fade-in-up"
              style={{ ...styles.leftSection, paddingTop: `${imageTop}px` }}
            >
              <div>
                <h2 style={styles.title}>{currentSlide.title}</h2>
                <p style={styles.descriptionText}>{currentSlide.description}</p>
              </div>

              <div style={styles.progressBar}>
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    style={{
                      ...styles.progressDot,
                      backgroundColor: index === currentIndex ? "#007bff" : "#ddd",
                      transform: index === currentIndex ? "scale(1.3)" : "scale(1)"
                    }}
                    aria-label={`Chuyển sang slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="fade-in-up delay-1" style={styles.rightSection}>
              <div style={styles.imageWrapper}>
                <img
                  ref={imageRef}
                  src={currentSlide.image}
                  alt={currentSlide.title}
                  style={{ ...styles.image, ...imageAnimStyle }}
                />
              </div>
            </div>
          </div>

          {/* QUICK START SECTION */}
          <div
            ref={quickStartRef}
            style={{
              padding: "50px 40px 150px",
              maxWidth: "1700px",
              margin: "0 auto"
            }}
          >
            <h2
              className="fade-in-up delay-2"
              style={{
                fontSize: "clamp(22px, 2.8vw, 34px)",
                fontWeight: "700",
                color: "#4A3728",
                marginBottom: "8px",
                fontFamily: "'Playfair Display', serif"
              }}
            >
              Quick Start
            </h2>
            <p
              className="fade-in-up delay-2"
              style={{
                color: "#4A3728",
                opacity: 0.6,
                fontSize: "16px",
                marginBottom: "36px",
                fontFamily: "'Be Vietnam Pro', sans-serif"
              }}
            >
              Chọn một tính năng để bắt đầu
            </p>

            {/* 3 cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "5vw",
                justifyItems: "center"
              }}
            >
              {[
                {
                  id: 1,
                  title: "Đấu Trường",
                  description: "Nơi bạn có thể tìm những công cụ hỗ trợ tranh biện",
                  image: "/src/assets/WhiteAndBlue_img.jpg",
                  accent: "#4f8ef7"
                },
                {
                  id: 2,
                  title: "Thư viện tài liệu",
                  description: "Tìm kiếm các tài liệu tranh biện đã được đăng tải",
                  image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
                  accent: "#f7874f"
                },
                {
                  id: 3,
                  title: "Mindmap",
                  description: "Lập ra Mindmap cho các chủ đề tranh biện bạn đang tham gia",
                  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
                  accent: "#4fc78e"
                }
              ].map((card, idx) => (
                <div
                  key={card.id}
                  className={`fade-in-up delay-${idx + 2}`}
                  style={{
                    width: "100%",
                    minHeight: "400px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    cursor: "pointer",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    fontFamily: "'Be Vietnam Pro', sans-serif",
                    color: "#3D2B1F",
                    backdropFilter: 'blur(10px)',
                    maxWidth: "600px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)"
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.12)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)"
                    e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"
                  }}
                >
                  <div style={{ position: "relative", overflow: "hidden", height: "180px" }}>
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.4s ease"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.06)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0, left: 0, right: 0,
                        height: "60px",
                        background: "linear-gradient(to top, rgba(0,0,0,0.18), transparent)"
                      }}
                    />
                  </div>

                  <div style={{ padding: "20px 22px 24px" }}>
                    <div
                      style={{
                        width: "32px", height: "3px",
                        borderRadius: "2px",
                        backgroundColor: card.accent,
                        marginBottom: "12px"
                      }}
                    />
                    <h3 style={{ fontSize: "17px", fontWeight: "600", color: "#1a1a1a", marginBottom: "8px" }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "#888", lineHeight: "1.6", marginBottom: "20px" }}>
                      {card.description}
                    </p>
                    <div
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        fontSize: "13px", fontWeight: "600",
                        color: card.accent, letterSpacing: "0.02em"
                      }}
                    >
                      Xem thêm
                      <span style={{ fontSize: "16px", lineHeight: 1 }}>→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end z-index wrapper */}
      </div>{/* end position:relative root */}

      {/* ===================== ABOUT US SECTION ===================== */}
      <div
        className="about-section"
        style={{
          padding: "200px 40px 80px",
          maxWidth: "1700px",
          margin: "-120px auto",
          boxSizing: "border-box"
        }}
      >
        {/* Hero banner */}
        <div className="about-hero fade-in-up">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1400&h=600&fit=crop"
            alt="About ReDLT"
          />
          <div className="about-hero-overlay">
            <h2 className="about-hero-title">
              Câu chuyện,<br />Tầm nhìn<br />& Giá trị
            </h2>
          </div>
          <p className="about-hero-sub">
            Tìm hiểu về cam kết của chúng tôi với sự xuất sắc, đổi mới và các nguyên tắc định hướng công việc mỗi ngày.
          </p>
          <button className="about-scroll-btn" aria-label="Cuộn xuống">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
        </div>

        {/* Body: quote + card */}
        <div className="about-body">
          {/* Left: quote + image */}
          <div className="fade-in-up delay-1">
            <span className="about-quote-mark">"</span>
            <p className="about-quote-text">
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <img
              className="about-quote-img"
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=300&fit=crop"
              alt="Học sinh tranh biện"
            />
          </div>

          {/* Right: dark info card */}
          <div className="about-card fade-in-up delay-2">
            <div className="about-card-label">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
              Về chúng tôi
            </div>
            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
            <p style={{ marginBottom: 0 }}>
              Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="about-stats fade-in-up delay-3">
          <div className="about-stat-item">
            <span className="about-stat-number">abc+</span>
            <span className="about-stat-label">Khum bt để gì</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">xyz+</span>
            <span className="about-stat-label">Cái này cũng v</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">ax²+bx+c</span>
            <span className="about-stat-label">Nốt cái này nữa</span>
          </div>
        </div>
      </div>
    </>
  )
}

const styles = {
  container: {
    maxHeight: "600px",
    maxWidth: "1700px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "30px",
    padding: "40px",
    borderRadius: "8px",
    boxSizing: "border-box"
  },
  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    alignSelf: "stretch",
    boxSizing: "border-box"
  },
  title: {
    fontSize: "clamp(25px, 2.8vw, 34px)",
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#333",
    fontFamily: "Be Vietnam Pro, sans-serif"
  },
  descriptionText: {
    fontSize: "clamp(15px, 1.8vw, 18px)",
    color: "#666",
    lineHeight: "1.6",
    fontFamily: "Be Vietnam Pro, sans-serif"
  },
  progressBar: {
    display: "flex",
    gap: "10px",
    marginTop: "20px"
  },
  progressDot: {
    width: "12px", height: "12px",
    borderRadius: "50%",
    border: "none", padding: 0,
    cursor: "pointer",
    transition: "background-color 0.3s ease, transform 0.2s ease"
  },
  rightSection: {
    flex: 1.4,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    maxHeight: "500px"
  },
  imageWrapper: {
    width: "100%",
    maxHeight: "100%",
    display: "flex",
    alignItems: "center",
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "auto",
    aspectRatio: "3 / 2",
    objectFit: "cover",
    borderRadius: "8px",
    WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%)",
    maskImage: "linear-gradient(to right, transparent 0%, black 35%)"
  }
}

export default Mainpage