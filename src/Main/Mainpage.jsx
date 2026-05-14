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
      title: "Slide 1",
      description: "Đây là mô tả cho ảnh thứ nhất",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Aspect_ratio_-_3x2.svg/330px-Aspect_ratio_-_3x2.svg.png"
    },
    {
      id: 2,
      title: "Slide 2",
      description: "Đây là mô tả cho ảnh thứ hai",
      image: "https://newbornposing.com/wp-content/uploads/2020/09/aspect-ratio-print-size-5.jpg"
    },
    {
      id: 3,
      title: "Slide 3",
      description: "Đây là mô tả cho ảnh thứ ba",
      image: "https://cdn.sanity.io/images/uwt8iot0/production/661c8eab8fd88f6b4539455e79dbfd0e2f3bd410-3000x2000.png"
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

        /* Animation khi load trang: Fade và Slide up */
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
      `}</style>

      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Be+Vietnam+Pro:wght@400;500;600&display=swap" />

      <div style={{ position: "relative" }}>

        {/* Gradient nền - Giữ nguyên không animation */}
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

        {/* Box chéo màu - Giữ nguyên không animation */}
        {quickStartTop > 0 && (
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: quickStartTop - 80,
              left: 0,
              right: 0,
              height: quickStartHeight + 40,
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
                clipPath: "polygon(0 0, 100% 80px, 100% 100%, 0 100%)",
              }}
            />
          </div>
        )}

        {/* z:3 — Toàn bộ nội dung nội dung - ÁP DỤNG ANIMATION TẠI ĐÂY */}
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
              padding: "60px 40px",
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
                  image: "https://images.unsplash.com/photo-1516321318423-f06f70db51ba?w=400&h=300&fit=crop",
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
                  className={`fade-in-up delay-${idx + 2}`} // Staggered delay cho từng card
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